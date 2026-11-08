-- Defense in depth for Supabase.
--
-- The NestJS API connects as the table owner, which bypasses RLS, so the
-- application-level tenant checks remain the primary access control.
-- Enabling RLS with NO policies denies all access to these tables through
-- Supabase's auto-generated Data API (PostgREST) for the `anon` and
-- `authenticated` roles, so a leaked anon key cannot read tenant data.
--
-- New tables added by later migrations must also run:
--   ALTER TABLE public."<table>" ENABLE ROW LEVEL SECURITY;
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END
$$;
