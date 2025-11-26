# Supabase Setup Guide

This guide will help you set up Supabase for the Pokemon-style game.

## Step 1: Create Supabase Tables

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **Run** to execute the SQL

This will create:
- `player_progress` - Stores player stardust points
- `player_point_nodes` - Tracks collected point nodes
- `player_trades` - Records marketplace purchases
- `nft_marketplace` - Marketplace listings (if not already exists)

## Step 2: Verify Supabase Client Configuration

The Supabase client is already configured in `src/lib/supabaseClient.js` with your project URL and anon key. If you need to update it:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'
```

## Step 3: Test the Integration

1. Start the game: `npm run dev`
2. The game will automatically:
   - Load your points from Supabase on startup
   - Sync points between localStorage and Supabase
   - Record collectible pickups
   - Record marketplace purchases
   - Award points for battle victories (50 points) and collectibles (25 points)

## Step 4: Populate Marketplace (Optional)

If you want to add marketplace items via SQL:

```sql
INSERT INTO public.nft_marketplace (id, name, description, price, image_url)
VALUES 
  ('ember-flare', 'Ember Flare Charm', 'Imbues Fireball attacks with extra plasma.', 450, '/img/fireball.png'),
  ('aquifer-petal', 'Aquifer Petal', 'Restores 35 HP instantly.', 280, '/img/embySprite.png'),
  ('starlit-core', 'Starlit Core Relic', 'Reduces incoming damage by 20%.', 450, '/img/draggleSprite.png');
```

Or use the existing seed data in the game code as fallback.

## Features

### Points System
- **Earn points** by:
  - Winning battles: +50 Stardust
  - Collecting items: +25 Stardust
- **Spend points** in the marketplace to purchase items
- Points are synced between localStorage and Supabase

### Trade History
- All marketplace purchases are recorded in `player_trades` table
- Includes item details, cost, and timestamp

### Point Node Tracking
- Collectible pickups are tracked in `player_point_nodes`
- Prevents duplicate collection across devices

## Player ID

Currently uses `'demo-player'` as the player ID. In production:
- Use Supabase Auth to get real user IDs
- Update `PLAYER_ID` constant in `src/components/Game.jsx`

## Troubleshooting

- **Points not syncing?** Check browser console for errors
- **Marketplace empty?** Game falls back to seed data if Supabase fails
- **RLS errors?** Make sure you ran the schema SQL with all policies

