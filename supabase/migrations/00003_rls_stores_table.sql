-- 00003_rls_stores_table.sql
-- Enable RLS on stores table and allow public SELECT access
-- This allows the map to load store locations via Supabase REST API

BEGIN;

-- Enable Row Level Security on stores
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Allow anon users to read all stores (data is public)
CREATE POLICY "allow_anon_select_stores" ON public.stores FOR SELECT USING (true);

COMMIT;
