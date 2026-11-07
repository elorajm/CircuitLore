-- F6 Lesson Progress Schema Verification Script
-- Safe to run: This script only reads database metadata and system catalogs.
-- No modifications to data or schema are made.
-- Compatible with Supabase SQL Editor (no psql-specific commands).
-- Wrap in transaction that rolls back to avoid any state changes.

BEGIN;

-- SECTION 1: Verify table exists and has correct structure
SELECT 'TABLE STRUCTURE CHECK' as verification_section;

-- Check if table exists
SELECT
  table_schema,
  table_name,
  'EXISTS' as table_status
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'lesson_progress'
UNION ALL
SELECT 'public', 'lesson_progress', 'NOT FOUND - FAIL'
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'lesson_progress'
);

-- Verify all required columns exist with correct types and nullability
SELECT
  ordinal_position as position,
  column_name,
  data_type,
  is_nullable,
  CASE
    WHEN column_default IS NOT NULL THEN 'Has default'
    ELSE 'No default'
  END as default_status
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'lesson_progress'
ORDER BY ordinal_position;

-- Expected: 10 rows with correct names and types
-- Missing columns: FAIL

-- SECTION 2: Verify constraints
SELECT 'CONSTRAINTS CHECK' as verification_section;

-- Check primary key
SELECT
  constraint_name,
  constraint_type,
  'PRIMARY KEY EXISTS' as status
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'lesson_progress'
  AND constraint_type = 'PRIMARY KEY'
UNION ALL
SELECT 'NONE', 'PRIMARY KEY', 'MISSING - FAIL'
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.table_constraints
  WHERE table_schema = 'public' AND table_name = 'lesson_progress'
    AND constraint_type = 'PRIMARY KEY'
);

-- Check unique constraint on (student_id, lesson_id)
SELECT
  constraint_name,
  constraint_type,
  'UNIQUE EXISTS' as status
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'lesson_progress'
  AND constraint_type = 'UNIQUE'
UNION ALL
SELECT 'NONE', 'UNIQUE', 'MISSING - FAIL'
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.table_constraints
  WHERE table_schema = 'public' AND table_name = 'lesson_progress'
    AND constraint_type = 'UNIQUE'
);

-- Check foreign key
SELECT
  constraint_name,
  constraint_type,
  'FOREIGN KEY EXISTS' as status
FROM information_schema.table_constraints
WHERE table_schema = 'public' AND table_name = 'lesson_progress'
  AND constraint_type = 'FOREIGN KEY'
UNION ALL
SELECT 'NONE', 'FOREIGN KEY', 'MISSING - FAIL'
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.table_constraints
  WHERE table_schema = 'public' AND table_name = 'lesson_progress'
    AND constraint_type = 'FOREIGN KEY'
);

-- Verify foreign key references profiles(id)
SELECT
  kcu.constraint_name,
  kcu.column_name as fk_column,
  ccu.table_name as referenced_table,
  ccu.column_name as referenced_column,
  'FK CORRECT' as status
FROM information_schema.key_column_usage kcu
JOIN information_schema.constraint_column_usage ccu
  ON kcu.constraint_name = ccu.constraint_name
WHERE kcu.table_schema = 'public'
  AND kcu.table_name = 'lesson_progress'
  AND ccu.table_name = 'profiles'
UNION ALL
SELECT 'NONE', 'student_id', 'profiles', 'id', 'FK MISSING - FAIL'
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.key_column_usage kcu
  JOIN information_schema.constraint_column_usage ccu
    ON kcu.constraint_name = ccu.constraint_name
  WHERE kcu.table_schema = 'public' AND kcu.table_name = 'lesson_progress'
    AND ccu.table_name = 'profiles'
);

-- SECTION 3: Verify Row Level Security is enabled
SELECT 'ROW LEVEL SECURITY CHECK' as verification_section;

SELECT
  c.relname as table_name,
  CASE c.relrowsecurity
    WHEN true THEN 'ENABLED'
    WHEN false THEN 'DISABLED - FAIL'
  END as rls_status
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' AND c.relname = 'lesson_progress'
UNION ALL
SELECT 'lesson_progress', 'NOT FOUND - FAIL'
WHERE NOT EXISTS (
  SELECT 1 FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public' AND c.relname = 'lesson_progress'
);

-- SECTION 4: Verify all 4 RLS policies exist
SELECT 'RLS POLICIES CHECK' as verification_section;

SELECT
  policyname,
  CASE cmd
    WHEN 'SELECT' THEN 'SELECT'
    WHEN 'INSERT' THEN 'INSERT'
    WHEN 'UPDATE' THEN 'UPDATE'
    WHEN 'DELETE' THEN 'DELETE'
    ELSE 'UNKNOWN - FAIL'
  END as policy_type,
  CASE WHEN qual IS NOT NULL THEN 'Has QUAL' ELSE 'No QUAL - FAIL' END as using_condition,
  CASE WHEN with_check IS NOT NULL THEN 'Has CHECK' ELSE 'No CHECK' END as check_condition
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'lesson_progress'
ORDER BY policyname;

-- Expected: Exactly 4 policies (delete, insert, select, update)
-- Missing policies: FAIL

-- SECTION 5: Verify table-level privileges
SELECT 'TABLE-LEVEL PRIVILEGES CHECK' as verification_section;

SELECT
  grantee,
  string_agg(privilege_type, ', ' ORDER BY privilege_type) as granted_privileges
FROM information_schema.table_privileges
WHERE table_schema = 'public' AND table_name = 'lesson_progress'
GROUP BY grantee
ORDER BY grantee;

-- Expected: authenticated has SELECT and DELETE at table level. INSERT and UPDATE are column-level only (sections 6 and 7)
-- If authenticated has table-level INSERT or UPDATE: FAIL

-- SECTION 6: Verify column-level INSERT privileges (critical security check)
SELECT 'COLUMN-LEVEL INSERT PRIVILEGES CHECK' as verification_section;

-- Show all INSERT privileges for authenticated
SELECT
  grantee,
  column_name,
  'CAN INSERT' as privilege_status
FROM information_schema.column_privileges
WHERE table_schema = 'public' AND table_name = 'lesson_progress'
  AND grantee = 'authenticated'
  AND privilege_type = 'INSERT'
ORDER BY column_name;

-- Expected columns for INSERT: student_id, lesson_id, status, completed_at, last_accessed_at, attempts_count, metadata
-- Unexpected columns: id, created_at, updated_at would be FAIL

-- SECTION 7: Verify column-level UPDATE privileges (critical security check)
SELECT 'COLUMN-LEVEL UPDATE PRIVILEGES CHECK' as verification_section;

-- Show all UPDATE privileges for authenticated
SELECT
  grantee,
  column_name,
  'CAN UPDATE' as privilege_status
FROM information_schema.column_privileges
WHERE table_schema = 'public' AND table_name = 'lesson_progress'
  AND grantee = 'authenticated'
  AND privilege_type = 'UPDATE'
ORDER BY column_name;

-- Expected columns for UPDATE: status, completed_at, last_accessed_at, attempts_count, metadata
-- Unexpected columns (these should NOT be updatable): id, student_id, created_at, updated_at
-- If any sensitive column is updatable: FAIL

-- SECTION 8: Verify sensitive columns CANNOT be INSERTed by authenticated
SELECT 'SENSITIVE COLUMNS CANNOT BE INSERTED' as verification_section;

-- Explicit test: authenticated should NOT have INSERT on these columns
SELECT
  'id' as column_name,
  CASE COUNT(*)
    WHEN 0 THEN 'PROTECTED - PASS (id cannot be inserted)'
    ELSE 'EXPOSED - FAIL (id can be inserted)'
  END as insert_protection
FROM information_schema.column_privileges
WHERE table_schema = 'public' AND table_name = 'lesson_progress'
  AND column_name = 'id' AND grantee = 'authenticated'
  AND privilege_type = 'INSERT'
UNION ALL
SELECT
  'created_at',
  CASE COUNT(*)
    WHEN 0 THEN 'PROTECTED - PASS (created_at cannot be inserted)'
    ELSE 'EXPOSED - FAIL (created_at can be inserted)'
  END
FROM information_schema.column_privileges
WHERE table_schema = 'public' AND table_name = 'lesson_progress'
  AND column_name = 'created_at' AND grantee = 'authenticated'
  AND privilege_type = 'INSERT'
UNION ALL
SELECT
  'updated_at',
  CASE COUNT(*)
    WHEN 0 THEN 'PROTECTED - PASS (updated_at cannot be inserted)'
    ELSE 'EXPOSED - FAIL (updated_at can be inserted)'
  END
FROM information_schema.column_privileges
WHERE table_schema = 'public' AND table_name = 'lesson_progress'
  AND column_name = 'updated_at' AND grantee = 'authenticated'
  AND privilege_type = 'INSERT';

-- SECTION 9: Verify sensitive columns CANNOT be UPDATEd by authenticated
SELECT 'SENSITIVE COLUMNS CANNOT BE UPDATED' as verification_section;

-- Explicit test: authenticated should NOT have UPDATE on these columns
SELECT
  'id' as column_name,
  CASE COUNT(*)
    WHEN 0 THEN 'PROTECTED - PASS (id cannot be updated)'
    ELSE 'EXPOSED - FAIL (id can be updated)'
  END as update_protection
FROM information_schema.column_privileges
WHERE table_schema = 'public' AND table_name = 'lesson_progress'
  AND column_name = 'id' AND grantee = 'authenticated'
  AND privilege_type = 'UPDATE'
UNION ALL
SELECT
  'created_at',
  CASE COUNT(*)
    WHEN 0 THEN 'PROTECTED - PASS (created_at cannot be updated)'
    ELSE 'EXPOSED - FAIL (created_at can be updated)'
  END
FROM information_schema.column_privileges
WHERE table_schema = 'public' AND table_name = 'lesson_progress'
  AND column_name = 'created_at' AND grantee = 'authenticated'
  AND privilege_type = 'UPDATE'
UNION ALL
SELECT
  'updated_at',
  CASE COUNT(*)
    WHEN 0 THEN 'PROTECTED - PASS (updated_at cannot be updated by client)'
    ELSE 'EXPOSED - FAIL (updated_at can be updated by client)'
  END
FROM information_schema.column_privileges
WHERE table_schema = 'public' AND table_name = 'lesson_progress'
  AND column_name = 'updated_at' AND grantee = 'authenticated'
  AND privilege_type = 'UPDATE'
UNION ALL
SELECT
  'student_id',
  CASE COUNT(*)
    WHEN 0 THEN 'PROTECTED - PASS (student_id cannot be updated)'
    ELSE 'EXPOSED - FAIL (student_id can be updated)'
  END
FROM information_schema.column_privileges
WHERE table_schema = 'public' AND table_name = 'lesson_progress'
  AND column_name = 'student_id' AND grantee = 'authenticated'
  AND privilege_type = 'UPDATE';

-- Expected: All checks should return PROTECTED - PASS
-- If any return EXPOSED - FAIL: security issue

-- SECTION 9: Verify trigger and trigger function
SELECT 'TRIGGERS AND FUNCTIONS CHECK' as verification_section;

-- Check trigger exists
SELECT
  trigger_name,
  event_object_table,
  event_manipulation,
  'TRIGGER EXISTS - PASS' as status
FROM information_schema.triggers
WHERE trigger_schema = 'public' AND event_object_table = 'lesson_progress'
  AND trigger_name = 'lesson_progress_update_timestamp'
UNION ALL
SELECT 'lesson_progress_update_timestamp', 'lesson_progress', 'UPDATE', 'MISSING - FAIL'
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.triggers
  WHERE trigger_schema = 'public' AND event_object_table = 'lesson_progress'
    AND trigger_name = 'lesson_progress_update_timestamp'
);

-- Check trigger function exists
SELECT
  routine_name,
  routine_type,
  'FUNCTION EXISTS - PASS' as status
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name = 'update_lesson_progress_timestamp'
UNION ALL
SELECT 'update_lesson_progress_timestamp', 'FUNCTION', 'MISSING - FAIL'
WHERE NOT EXISTS (
  SELECT 1 FROM information_schema.routines
  WHERE routine_schema = 'public' AND routine_name = 'update_lesson_progress_timestamp'
);

-- SECTION 10: Security summary checks
SELECT 'SECURITY SUMMARY' as verification_section;

-- Check 1: PUBLIC has no table privileges
SELECT
  'PUBLIC' as role,
  CASE COUNT(*)
    WHEN 0 THEN 'No privileges - PASS'
    ELSE 'Has ' || COUNT(*) || ' privileges - FAIL'
  END as access_check
FROM information_schema.table_privileges
WHERE table_schema = 'public' AND table_name = 'lesson_progress' AND grantee = 'PUBLIC'
UNION ALL

-- Check 2: anon has no table privileges
SELECT
  'anon',
  CASE COUNT(*)
    WHEN 0 THEN 'No privileges - PASS'
    ELSE 'Has ' || COUNT(*) || ' privileges - FAIL'
  END
FROM information_schema.table_privileges
WHERE table_schema = 'public' AND table_name = 'lesson_progress' AND grantee = 'anon'
UNION ALL

-- Check 3: authenticated has no table-level UPDATE (UPDATE only via column grants)
SELECT
  'authenticated',
  CASE COUNT(*)
    WHEN 0 THEN 'No table-level UPDATE - PASS'
    WHEN 1 THEN 'Has table-level UPDATE - FAIL'
    ELSE 'Multiple table UPDATE grants - FAIL'
  END
FROM information_schema.table_privileges
WHERE table_schema = 'public' AND table_name = 'lesson_progress'
  AND grantee = 'authenticated' AND privilege_type = 'UPDATE';

-- SECTION 11: Important limitations and documentation
SELECT 'IMPORTANT LIMITATIONS' as section;
SELECT 'NOTE: RLS enforces student isolation (WHO can access) but does NOT validate completion (WHAT is true)' as note
UNION ALL
SELECT 'NOTE: RLS filtering returns 0 rows (not 403) when student queries another student data'
UNION ALL
SELECT 'NOTE: RLS WITH CHECK returns 403 Forbidden when student tries to INSERT/UPDATE with wrong student_id'
UNION ALL
SELECT 'NOTE: Application must validate progress state transitions (app-layer responsibility)'
UNION ALL
SELECT 'NOTE: Timestamp trigger ensures updated_at reflects actual modification, not client-provided time'
UNION ALL
SELECT 'NOTE: Column-level privileges prevent clients from setting id, created_at, updated_at, or changing student_id'
UNION ALL
SELECT 'NOTE: Upsert (INSERT ... ON CONFLICT DO UPDATE) needs UPDATE on every SET column; PostgREST upsert sets student_id and lesson_id, which authenticated cannot update. The app does not use upsert';

ROLLBACK;
