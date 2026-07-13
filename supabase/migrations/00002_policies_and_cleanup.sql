-- 00002_policies_and_cleanup.sql
-- Tighten insert policy to only allow known products and add cleanup function to remove logs older than 24 hours.

BEGIN;

-- Replace permissive insert policy with a constrained one
DROP POLICY IF EXISTS "allow_anon_insert_logs" ON public.logs;

CREATE POLICY "allow_anon_insert_logs" ON public.logs
  FOR INSERT
  WITH CHECK (
    product IN (
      'Arnott''s Shapes Chicken',
      'Arnott''s Shapes BBQ',
      'Arnott''s Shapes Pizza'
    )
    AND loggedAt >= now() - interval '1 day'
  );

-- Create a helper function to delete logs older than 24 hours
CREATE OR REPLACE FUNCTION public.delete_old_logs()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM public.logs WHERE loggedAt < now() - interval '24 hours';
$$;

-- Scheduling via pg_cron is optional. Install/enable pg_cron in project if you want automated scheduling.
-- Alternatively, trigger delete_old_logs() from an external scheduler or Supabase 'Scheduled Functions'.

COMMIT;
