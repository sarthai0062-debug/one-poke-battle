-- Supabase Schema for Pokemon-Style Game
-- Run this in your Supabase SQL Editor

-- 1. Player Progress Table (stores stardust points)
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

-- 2. Player Point Nodes Table (tracks collected point nodes)
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

-- 3. Player Trades Table (records marketplace purchases)
create table if not exists public.player_trades (
  id uuid primary key default gen_random_uuid(),
  player_id text not null,
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

-- 4. NFT Marketplace Table (if not already exists)
create table if not exists public.nft_marketplace (
  id text primary key,
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

