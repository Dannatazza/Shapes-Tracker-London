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

-- Try to schedule the cleanup using pg_cron if available. This block is safe if pg_cron is not installed.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'schedule' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'cron')) THEN
    -- schedule to run at minute 0 every hour
    PERFORM cron.schedule('cleanup_old_logs', '0 * * * *', $$CALL public.delete_old_logs();$$);
  END IF;
END
$$;

COMMIT;
