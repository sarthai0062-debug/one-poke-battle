-- Check if player_point_nodes table exists and create if needed
-- Run this in your Supabase SQL Editor

-- Check if table exists (optional - just for verification)
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'player_point_nodes'
);

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.player_point_nodes (
  player_id text NOT NULL,
  node_id text NOT NULL,
  collected_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (player_id, node_id)
);

-- Enable Row Level Security
ALTER TABLE public.player_point_nodes ENABLE ROW LEVEL SECURITY;

-- Create/Replace RLS Policies
DROP POLICY IF EXISTS "anon_select_point_nodes" ON public.player_point_nodes;
CREATE POLICY "anon_select_point_nodes"
ON public.player_point_nodes
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "anon_insert_point_nodes" ON public.player_point_nodes;
CREATE POLICY "anon_insert_point_nodes"
ON public.player_point_nodes
FOR INSERT
WITH CHECK (true);

-- Verify the table was created
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'player_point_nodes'
ORDER BY ordinal_position;

