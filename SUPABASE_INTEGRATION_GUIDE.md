# Supabase Integration Guide - Pokemon-Style Game

## Overview

This document describes how Supabase is integrated into the Pokemon-style game for **player progression tracking**, **marketplace listings**, and **trade history**. Use this guide to integrate the same Supabase setup into a new or previous version of the game.

### High-Level Architecture

Supabase serves as a **simple backend** for:
- **Player stardust points** (total accumulated)
- **Point node collection tracking** (optional, for anti-cheat/cross-device sync)
- **Marketplace trade history** (audit log)
- **NFT marketplace listings** (dynamic shop inventory)

---

## Database Tables

### 1. `player_progress`

**Purpose**: Stores each player's **current total stardust points** (one row per player).

#### Schema

```sql
create table if not exists public.player_progress (
  player_id text primary key,
  points integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.player_progress enable row level security;

-- RLS Policies (allow anonymous read/write for game simplicity)
create policy "anon_select_player_progress"
on public.player_progress
for select
using (true);

create policy "anon_insert_player_progress"
on public.player_progress
for insert
with check (true);

create policy "anon_update_player_progress"
on public.player_progress
for update
using (true)
with check (true);
```

#### How It's Used in the Game

**Constants:**
```javascript
const PLAYER_ID = 'demo-player'  // In production, use actual user ID
const PLAYER_PROGRESS_TABLE = 'player_progress'
```

**On Game Load (Hydration):**
```javascript
async function hydratePointsFromSupabase() {
  if (!window.supabaseClient) return
  
  const { data, error } = await window.supabaseClient
    .from(PLAYER_PROGRESS_TABLE)
    .select('points')
    .eq('player_id', PLAYER_ID)
    .maybeSingle()
    
  if (data && typeof data.points === 'number') {
    // Take the maximum of local vs remote (prevents rollback)
    pointState.total = Math.max(pointState.total, data.points)
    updatePointsUI()
    persistPointStateLocally()  // Sync to localStorage
  }
}
```

**On Points Change (Persistence):**
```javascript
async function persistPointsToSupabase() {
  if (!window.supabaseClient) return
  
  await window.supabaseClient
    .from(PLAYER_PROGRESS_TABLE)
    .upsert(
      {
        player_id: PLAYER_ID,
        points: pointState.total
      },
      { onConflict: 'player_id' }  // Update if exists, insert if new
    )
}
```

**Integration Pattern:**
- **Read once on load**: Fetch remote points, merge with local (take max)
- **Write on every change**: After any points gain/spend, upsert the new total
- **LocalStorage as cache**: Also persist locally for offline-first experience

---

### 2. `player_point_nodes`

**Purpose**: Tracks which **stardust point nodes** each player has collected (optional, for server-side validation).

#### Schema

```sql
create table if not exists public.player_point_nodes (
  player_id text not null,
  node_id text not null,
  collected_at timestamptz not null default now(),
  primary key (player_id, node_id)
);

alter table public.player_point_nodes enable row level security;

create policy "anon_select_point_nodes"
on public.player_point_nodes
for select
using (true);

create policy "anon_insert_point_nodes"
on public.player_point_nodes
for insert
with check (true);
```

#### How It's Used in the Game

**Constants:**
```javascript
const PLAYER_POINT_NODES_TABLE = 'player_point_nodes'
```

**On Game Load (Hydration):**
```javascript
async function hydrateCollectedNodesFromSupabase() {
  if (!window.supabaseClient) return
  
  const { data, error } = await window.supabaseClient
    .from(PLAYER_POINT_NODES_TABLE)
    .select('node_id')
    .eq('player_id', PLAYER_ID)
    
  if (Array.isArray(data)) {
    data.forEach((row) => {
      if (row?.node_id) {
        pointState.collectedIds.add(row.node_id)
      }
    })
    // Mark nodes as collected in-game
    applyCollectedPointsToNodes()
    persistPointStateLocally()
  }
}
```

**On Node Collection:**
```javascript
async function recordPointNodeCollection(node) {
  if (!window.supabaseClient) return
  
  try {
    await window.supabaseClient
      .from(PLAYER_POINT_NODES_TABLE)
      .insert({
        player_id: PLAYER_ID,
        node_id: node.id
      })
  } catch (error) {
    // Ignore duplicate key errors (23505)
    if (error.code === '23505') return
    console.warn('Unable to record point node collection', error)
  }
}
```

**Integration Pattern:**
- **Read on load**: Fetch all collected node IDs, mark them in-game
- **Write on collection**: Insert a new row when player collects a node
- **Primary key prevents duplicates**: `(player_id, node_id)` ensures idempotency
- **Optional table**: Can skip if you only want localStorage tracking

---

### 3. `player_trades`

**Purpose**: Records **every marketplace purchase** a player makes (audit log / trade history).

#### Schema

```sql
create table if not exists public.player_trades (
  id uuid primary key default gen_random_uuid(),
  player_id text not null references public.player_progress(player_id),
  item_id text,
  item_name text,
  cost integer not null,
  snapshot jsonb,
  traded_at timestamptz not null default now()
);

alter table public.player_trades enable row level security;

create policy "anon_select_player_trades"
on public.player_trades
for select
using (true);

create policy "anon_insert_player_trades"
on public.player_trades
for insert
with check (true);
```

#### How It's Used in the Game

**Constants:**
```javascript
const PLAYER_TRADES_TABLE = 'player_trades'
```

**On Marketplace Purchase:**
```javascript
async function recordMarketplacePurchase(item, cost) {
  if (!window.supabaseClient) return
  
  try {
    await window.supabaseClient
      .from(PLAYER_TRADES_TABLE)
      .insert({
        player_id: PLAYER_ID,
        item_id: item.id ?? item.name,
        item_name: item.name ?? 'Unknown Item',
        cost,
        snapshot: item  // Full item object as JSONB for audit
      })
  } catch (error) {
    console.warn('Unable to record marketplace purchase', error)
  }
}
```

**Integration Pattern:**
- **Write-only**: Game doesn't read from this table (it's for history/audit)
- **Insert on purchase**: Record every successful marketplace trade
- **JSONB snapshot**: Store full item object for future reference
- **Use cases**: Trade history UI, economic balance analysis, anti-cheat

---

### 4. `nft_marketplace`

**Purpose**: Stores **marketplace listings** that the in-game shop displays.

#### Schema (Inferred from Usage)

```sql
-- Note: This table schema is not explicitly defined in schema.sql
-- but inferred from supabase_nft_inserts.sql and game code

create table if not exists public.nft_marketplace (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null,  -- Cost in stardust points
  image_url text,
  created_at timestamptz default now()
);

alter table public.nft_marketplace enable row level security;

-- Allow public read, restrict write to authenticated users (or admin)
create policy "anon_select_marketplace"
on public.nft_marketplace
for select
using (true);
```

#### Sample Data

See `supabase_nft_inserts.sql` for example inserts:

```sql
INSERT INTO public.nft_marketplace (name, description, price, image_url)
VALUES (
  'Ember Flare Charm',
  'A mystical charm forged from Draggle scales. Permanently increases Fireball damage by 35%...',
  450,
  './img/fireball.png'
);
```

#### How It's Used in the Game

**Constants:**
```javascript
const MARKETPLACE_TABLE_NAME = 'nft_marketplace'
const MARKETPLACE_SEED_LISTINGS = [
  // Fallback local listings if Supabase fails
  { id: 'seed-ember-flare', name: 'Ember Flare Charm', ... },
  // ...
]
```

**Fetching Listings:**
```javascript
async function fetchMarketplaceItems({ force = false } = {}) {
  if (!window.supabaseClient) {
    // Fallback to seed listings
    marketplaceState.items = MARKETPLACE_SEED_LISTINGS
    return
  }
  
  marketplaceState.isLoading = true
  
  const { data, error } = await window.supabaseClient
    .from(MARKETPLACE_TABLE_NAME)
    .select('id,name,description,price,image_url')
    .order('price', { ascending: true })
    
  marketplaceState.isLoading = false
  
  if (error) {
    console.error('Supabase marketplace error:', error)
    // Fallback to seed listings
    marketplaceState.items = MARKETPLACE_SEED_LISTINGS
  } else {
    marketplaceState.items = data && data.length > 0 ? data : MARKETPLACE_SEED_LISTINGS
  }
  
  updateMarketplaceUI()
}
```

**Integration Pattern:**
- **Read-only from game**: Game fetches listings to display
- **Fallback to seed data**: If Supabase fails/empty, use local array
- **Dynamic inventory**: Add/edit listings in Supabase dashboard without code changes
- **Purchase flow**: Check player points, deduct, add to inventory, record trade

---

## Supabase Client Setup

### Configuration

**File: `js/supabaseClient.js`**

```javascript
;(function initSupabaseClient() {
  if (!window.supabase) {
    console.warn('Supabase library not found on window.')
    return
  }

  const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'
  const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'

  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  )
})()
```

### CDN Script (in `index.html`)

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
<script src="js/supabaseClient.js"></script>
```

### ES Module Alternative (for React/Vite)

```javascript
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
```

---

## Integration Steps for a New Project

### Step 1: Create Tables in Supabase

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Run the contents of `supabase/schema.sql`:
   - Creates `player_progress`
   - Creates `player_trades`
   - Creates `player_point_nodes`
   - Sets up RLS policies
4. (Optional) Create `nft_marketplace` table manually or via SQL:

```sql
create table if not exists public.nft_marketplace (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price integer not null,
  image_url text,
  created_at timestamptz default now()
);

alter table public.nft_marketplace enable row level security;

create policy "anon_select_marketplace"
on public.nft_marketplace
for select
using (true);
```

5. Run `supabase_nft_inserts.sql` to populate sample marketplace listings

### Step 2: Install Supabase Client

**For Vanilla JS:**
- Add CDN script to `index.html` (see above)

**For React/Vite/ES Modules:**
```bash
npm install @supabase/supabase-js
```

### Step 3: Initialize Client

Create `js/supabaseClient.js` (or `src/services/supabaseClient.ts` for React) with your project URL and anon key.

### Step 4: Integrate Points System

**On Game Load:**
```javascript
// Hydrate points from Supabase
async function loadPlayerPoints() {
  const PLAYER_ID = 'your-player-id'  // Use actual user ID
  
  const { data } = await supabaseClient
    .from('player_progress')
    .select('points')
    .eq('player_id', PLAYER_ID)
    .maybeSingle()
    
  const remotePoints = data?.points ?? 0
  const localPoints = parseInt(localStorage.getItem('points') || '0', 10)
  
  // Take maximum (prevent rollback)
  const total = Math.max(remotePoints, localPoints)
  setPoints(total)
  localStorage.setItem('points', String(total))
}
```

**On Points Change:**
```javascript
async function savePlayerPoints(newTotal) {
  const PLAYER_ID = 'your-player-id'
  
  await supabaseClient
    .from('player_progress')
    .upsert(
      { player_id: PLAYER_ID, points: newTotal },
      { onConflict: 'player_id' }
    )
    
  localStorage.setItem('points', String(newTotal))
}
```

### Step 5: Integrate Point Nodes (Optional)

**On Load:**
```javascript
async function loadCollectedNodes() {
  const { data } = await supabaseClient
    .from('player_point_nodes')
    .select('node_id')
    .eq('player_id', PLAYER_ID)
    
  const collectedIds = new Set(data?.map(r => r.node_id) ?? [])
  // Mark nodes as collected in your game state
  markNodesAsCollected(collectedIds)
}
```

**On Collection:**
```javascript
async function recordNodeCollection(nodeId) {
  await supabaseClient
    .from('player_point_nodes')
    .insert({ player_id: PLAYER_ID, node_id: nodeId })
    // Ignore duplicate errors (23505)
}
```

### Step 6: Integrate Marketplace

**Fetch Listings:**
```javascript
async function loadMarketplaceListings() {
  const { data, error } = await supabaseClient
    .from('nft_marketplace')
    .select('id,name,description,price,image_url')
    .order('price', { ascending: true })
    
  if (error) {
    // Fallback to local seed data
    return FALLBACK_LISTINGS
  }
  
  return data && data.length > 0 ? data : FALLBACK_LISTINGS
}
```

**On Purchase:**
```javascript
async function purchaseItem(item) {
  // 1. Check points
  if (currentPoints < item.price) {
    showError('Not enough points')
    return
  }
  
  // 2. Deduct points
  const newTotal = currentPoints - item.price
  await savePlayerPoints(newTotal)
  
  // 3. Add to inventory (local state)
  addToInventory(item)
  
  // 4. Record trade
  await supabaseClient
    .from('player_trades')
    .insert({
      player_id: PLAYER_ID,
      item_id: item.id ?? item.name,
      item_name: item.name,
      cost: item.price,
      snapshot: item
    })
}
```

---

## Security Considerations

### Row Level Security (RLS)

All tables use **anonymous read/write policies** for simplicity. In production:

1. **Add authentication**: Use Supabase Auth to get real user IDs
2. **Restrict policies**: Only allow users to read/write their own `player_progress` rows:

```sql
create policy "users_select_own_progress"
on public.player_progress
for select
using (auth.uid()::text = player_id);

create policy "users_update_own_progress"
on public.player_progress
for update
using (auth.uid()::text = player_id)
with check (auth.uid()::text = player_id);
```

3. **Marketplace**: Keep public read, restrict write to admins only

### Player ID

Currently uses a hardcoded `PLAYER_ID = 'demo-player'`. In production:
- Use Supabase Auth user ID: `auth.uid()`
- Or generate a unique ID per session/device

---

## Testing

### Local Development

1. Create a test Supabase project (free tier)
2. Run schema SQL to create tables
3. Insert test data via SQL Editor or dashboard
4. Test read/write operations in browser console:

```javascript
// Test points read
const { data } = await window.supabaseClient
  .from('player_progress')
  .select('*')
  .eq('player_id', 'demo-player')

// Test points write
await window.supabaseClient
  .from('player_progress')
  .upsert({ player_id: 'demo-player', points: 100 })
```

### Production Checklist

- [ ] Replace hardcoded `PLAYER_ID` with real user IDs
- [ ] Update RLS policies to restrict access
- [ ] Use environment variables for Supabase URL/key
- [ ] Add error handling for network failures
- [ ] Implement retry logic for failed writes
- [ ] Add loading states in UI
- [ ] Test offline behavior (localStorage fallback)

---

## File Reference

- **Schema**: `supabase/schema.sql`
- **Sample Data**: `supabase_nft_inserts.sql`
- **Client Init**: `js/supabaseClient.js`
- **Usage Examples**: `index.js` (functions: `hydratePointsFromSupabase`, `persistPointsToSupabase`, `fetchMarketplaceItems`, etc.)

---

## Summary

This Supabase integration provides:
- ✅ **Persistent player progression** (points survive refresh/device change)
- ✅ **Server-side validation** (optional point node tracking)
- ✅ **Trade history** (audit log for marketplace purchases)
- ✅ **Dynamic marketplace** (update shop without code changes)

The pattern is **simple and scalable**: read on load, write on change, with localStorage as a cache layer for offline-first experience.

