-- Pre-migration checklist: Identify existing database objects
-- SAFE TO RUN: This script only reads; it does not modify the database.
-- Run this before applying 20261010000000_profiles_security.sql to detect conflicts.

BEGIN;

-- Check if public.profiles table already exists
SELECT 'TABLE: public.profiles' AS object_type,
       EXISTS (
         SELECT 1 FROM pg_tables
         WHERE schemaname = 'public' AND tablename = 'profiles'
       ) AS exists,
       'CONFLICT: Table exists. Review contents before migration.'
         AS note;

-- Check if any of the required trigger functions already exist
SELECT 'FUNCTION: public.set_profile_updated_at()' AS object_type,
       EXISTS (
         SELECT 1 FROM pg_proc
         WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
           AND proname = 'set_profile_updated_at'
       ) AS exists,
       'CONFLICT: Function exists. Review definition before migration.'
         AS note

UNION ALL

SELECT 'FUNCTION: public.prevent_untrusted_profile_identity_changes()',
       EXISTS (
         SELECT 1 FROM pg_proc
         WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
           AND proname = 'prevent_untrusted_profile_identity_changes'
       ),
       'CONFLICT: Function exists. Review definition before migration.'

UNION ALL

SELECT 'FUNCTION: public.create_profile_for_auth_user()',
       EXISTS (
         SELECT 1 FROM pg_proc
         WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
           AND proname = 'create_profile_for_auth_user'
       ),
       'CONFLICT: Function exists. Review definition before migration.'

UNION ALL

SELECT 'TRIGGER: profiles_set_updated_at (on public.profiles)',
       EXISTS (
         SELECT 1 FROM pg_trigger
         WHERE tgrelid = 'public.profiles'::regclass
           AND tgname = 'profiles_set_updated_at'
       ),
       'CONFLICT: Trigger exists. Review definition before migration.'

UNION ALL

SELECT 'TRIGGER: profiles_protect_identity_fields (on public.profiles)',
       EXISTS (
         SELECT 1 FROM pg_trigger
         WHERE tgrelid = 'public.profiles'::regclass
           AND tgname = 'profiles_protect_identity_fields'
       ),
       'CONFLICT: Trigger exists. Review definition before migration.'

UNION ALL

SELECT 'TRIGGER: on_auth_user_created_create_profile (on auth.users)',
       EXISTS (
         SELECT 1 FROM pg_trigger
         WHERE tgrelid = 'auth.users'::regclass
           AND tgname = 'on_auth_user_created_create_profile'
       ),
       'CONFLICT: Auth trigger exists. Review definition before migration.';

-- If public.profiles exists, show its current schema
-- (only if the table exists; otherwise this query has no output)
\echo ''
\echo 'TABLE SCHEMA (if public.profiles exists):'
\echo ''

SELECT
  a.attname AS column_name,
  pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
  a.attnotnull AS not_null
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
WHERE c.relname = 'profiles'
  AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND a.attnum > 0
ORDER BY a.attnum;

-- If public.profiles exists, show current RLS status
\echo ''
\echo 'RLS STATUS (if public.profiles exists):'
\echo ''

SELECT
  'public.profiles' AS table_name,
  c.relrowsecurity AS rls_enabled
FROM pg_class c
WHERE c.relname = 'profiles'
  AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- If public.profiles exists, show current policies
\echo ''
\echo 'ROW LEVEL SECURITY POLICIES (if public.profiles exists):'
\echo ''

SELECT
  policyname,
  cmd,
  roles::text,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- If public.profiles exists, show current column-level grants
\echo ''
\echo 'COLUMN-LEVEL GRANTS (if public.profiles exists):'
\echo ''

SELECT
  grantee,
  string_agg(privilege_type, ', ') AS privileges,
  is_grantable
FROM information_schema.column_privileges
WHERE table_schema = 'public' AND table_name = 'profiles'
GROUP BY grantee, is_grantable
ORDER BY grantee;

-- Summary: count how many conflicts exist
\echo ''
\echo 'MIGRATION READINESS SUMMARY:'
\echo ''

WITH conflicts AS (
  SELECT COUNT(*) AS conflict_count
  FROM (
    SELECT EXISTS (
      SELECT 1 FROM pg_tables
      WHERE schemaname = 'public' AND tablename = 'profiles'
    ) AS table_conflict
    UNION ALL
    SELECT EXISTS (
      SELECT 1 FROM pg_proc
      WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND proname IN ('set_profile_updated_at', 'prevent_untrusted_profile_identity_changes', 'create_profile_for_auth_user')
    )
    UNION ALL
    SELECT EXISTS (
      SELECT 1 FROM pg_trigger
      WHERE (tgrelid = 'public.profiles'::regclass OR tgrelid = 'auth.users'::regclass)
        AND tgname IN ('profiles_set_updated_at', 'profiles_protect_identity_fields', 'on_auth_user_created_create_profile')
    )
  ) AS checks
)
SELECT
  CASE
    WHEN conflict_count = 0 THEN '✓ SAFE: No existing objects found. Migration can proceed.'
    ELSE '✗ CONFLICT: ' || conflict_count::text || ' object type(s) already exist. Review above details before migration.'
  END AS status
FROM conflicts;

ROLLBACK;
