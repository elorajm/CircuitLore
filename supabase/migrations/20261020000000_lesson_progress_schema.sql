BEGIN;

-- F6 Lesson Progress Schema Migration
-- This migration creates the public.lesson_progress table to track student lesson completion.
--
-- Security model:
-- - Row Level Security (RLS) ensures students can only access their own progress
-- - Column-level grants (INSERT and UPDATE) control which fields authenticated users can modify
-- - Server-owned fields (id, created_at, updated_at) are protected from direct user input
-- - Trigger maintains updated_at automatically
-- - Foreign key cascade deletes all progress if student account is deleted
--
-- Timestamp ownership:
-- - id: Server-generated (UUID), immutable, not grantable for INSERT or UPDATE
-- - created_at: Server-generated (now()), immutable, not grantable for INSERT or UPDATE
-- - updated_at: Server-generated and auto-maintained by trigger, not grantable for INSERT, grant UPDATE only to function
-- - completed_at: App-provided (set when lesson marked complete), grantable for both INSERT and UPDATE
-- - last_accessed_at: Server-generated (now()), auto-set on INSERT, updated by app on subsequent access
--
-- RLS limitation:
-- - RLS protects WHO accesses progress data but does NOT validate WHETHER a lesson was actually completed
-- - Application layer must validate that progress state transitions are legitimate
-- - RLS filtering returns 0 rows (not 403 error) when a student queries another student's data
--
-- Column privilege model:
-- - authenticated can INSERT only: student_id, lesson_id, status, completed_at, last_accessed_at, attempts_count, metadata
-- - authenticated can UPDATE only: status, completed_at, last_accessed_at, attempts_count, metadata
-- - authenticated cannot INSERT id, created_at, or updated_at, and cannot UPDATE id, student_id, created_at, or updated_at
-- - student_id can be inserted only as the caller's own ID (enforced by RLS WITH CHECK)
-- - Upsert (INSERT ... ON CONFLICT DO UPDATE) is not usable by authenticated: it needs UPDATE on student_id and lesson_id, which are not granted. The app reads the row, then inserts or runs a compare-and-set update

CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id text NOT NULL,

  status text NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed')),

  completed_at timestamptz,
  last_accessed_at timestamptz NOT NULL DEFAULT now(),

  attempts_count integer NOT NULL DEFAULT 0
    CHECK (attempts_count >= 0),

  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (student_id, lesson_id)
);

-- Enable Row Level Security on the lesson_progress table
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- Revoke all default privileges from PUBLIC roles
REVOKE ALL ON TABLE public.lesson_progress FROM PUBLIC, anon, authenticated;

-- Grant table-level privileges to authenticated users
-- SELECT: allow authenticated users to view their own progress (filtered by RLS)
-- INSERT: do NOT grant at table level; use column-level grants only (see below)
-- DELETE: allow authenticated users to delete their own progress records (filtered by RLS)
-- UPDATE: do NOT grant at table level; use column-level grants instead (see below)
GRANT SELECT, DELETE ON TABLE public.lesson_progress TO authenticated;

-- Column-level INSERT privileges
-- Authenticated users can INSERT values for these columns (server-owned fields get defaults):
-- - student_id: must be own user ID (enforced by RLS WITH CHECK on INSERT)
-- - lesson_id: app-provided lesson identifier
-- - status: app-provided status value
-- - completed_at: app-provided when marking complete (can be null initially)
-- - last_accessed_at: app-provided access time (will default to now() if omitted)
-- - attempts_count: app-provided attempt counter (will default to 0 if omitted)
-- - metadata: app-provided flexible data (will default to {} if omitted)
-- NOT granted for INSERT: id (auto-generated), created_at (auto-set), updated_at (auto-set)
GRANT INSERT (student_id, lesson_id, status, completed_at, last_accessed_at, attempts_count, metadata)
  ON TABLE public.lesson_progress TO authenticated;

-- Column-level UPDATE privileges
-- Authenticated users can UPDATE only these columns (not student_id, id, or created_at):
-- - status: update lesson progress status
-- - completed_at: update completion timestamp
-- - last_accessed_at: update access time on subsequent visits
-- - attempts_count: update attempt counter
-- - metadata: update flexible data (e.g., quiz scores)
-- The trigger automatically maintains updated_at; do not grant UPDATE on it here
-- NOT granted for UPDATE: id (immutable), student_id (prevents ownership changes), created_at (immutable)
GRANT UPDATE (status, completed_at, last_accessed_at, attempts_count, metadata)
  ON TABLE public.lesson_progress TO authenticated;

-- RLS Policy 1: Students can only SELECT their own progress records
-- USING clause filters rows: only returns rows where student_id = auth.uid()
-- If a student queries another student's row: 0 rows returned (not a 403 error)
CREATE POLICY lesson_progress_select_own
  ON public.lesson_progress
  FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

-- RLS Policy 2: Students can only INSERT progress records where student_id is their own user ID
-- WITH CHECK enforces that the row being inserted must have student_id = auth.uid()
-- If app tries to insert with a different student_id: 403 Forbidden error
-- Combined with column-level INSERT grant, ensures only allowed columns can be inserted
CREATE POLICY lesson_progress_insert_own
  ON public.lesson_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- RLS Policy 3: Students can only UPDATE their own progress records
-- USING checks that the existing row belongs to them (student_id = auth.uid())
-- WITH CHECK ensures the updated row still belongs to them (prevents changing student_id)
-- If a student tries to UPDATE a row they don't own: 0 rows updated (not a 403 error)
-- If a student tries to change student_id: 403 Forbidden error (WITH CHECK fails)
-- Combined with column-level UPDATE grant, ensures only allowed columns can be updated
CREATE POLICY lesson_progress_update_own
  ON public.lesson_progress
  FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- RLS Policy 4: Students can only DELETE their own progress records
-- USING clause filters rows: only deletes rows where student_id = auth.uid()
-- If a student tries to delete another student's row: 0 rows deleted (not a 403 error)
CREATE POLICY lesson_progress_delete_own
  ON public.lesson_progress
  FOR DELETE
  TO authenticated
  USING (student_id = auth.uid());

-- Trigger function: Automatically update the updated_at timestamp when a row changes
-- Uses SET search_path = '' to prevent search path injection attacks
-- Only performs a safe timestamp update; no complex logic
-- Runs as a BEFORE UPDATE trigger: executes with the permission context of the UPDATE statement
CREATE OR REPLACE FUNCTION public.update_lesson_progress_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;

-- Revoke direct execution privileges on the timestamp function
-- This prevents students from calling the function directly; it only runs via trigger
REVOKE ALL ON FUNCTION public.update_lesson_progress_timestamp() FROM PUBLIC, anon, authenticated;

-- Create trigger: Automatically call the timestamp function before every UPDATE
-- This ensures updated_at is always current and cannot be manually set by the client
-- The trigger fires BEFORE UPDATE, overwrites any client-provided updated_at value with now()
CREATE TRIGGER lesson_progress_update_timestamp
  BEFORE UPDATE ON public.lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lesson_progress_timestamp();

COMMIT;
