import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as progressService from './progressService.js'
import migrationSql from '../../supabase/migrations/20261020000000_lesson_progress_schema.sql?raw'

// These tests guard the lesson_progress security model in two ways:
// 1. The migration text must keep the RLS policies and column grants the app relies on.
// 2. The app's write payloads must stay inside those granted columns.
// They do not prove what is applied to the hosted Supabase database. That still needs the
// dashboard checks in the verification script.

// Remove SQL comments and collapse whitespace so each statement can be compared exactly
function normalizedStatements(sql) {
  return sql
    .replace(/--.*$/gm, '')
    .split(';')
    .map((statement) => statement.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

const statements = normalizedStatements(migrationSql)

function statementsStartingWith(prefix) {
  return statements.filter((statement) => statement.startsWith(prefix))
}

function grantedColumns(privilege) {
  const match = statements.find((statement) => statement.startsWith(`GRANT ${privilege} (`))
  const list = match.match(/\(([^)]*)\)/)[1]
  return list.split(',').map((column) => column.trim())
}

const INSERT_COLUMNS = grantedColumns('INSERT')
const UPDATE_COLUMNS = grantedColumns('UPDATE')

vi.mock('./supabaseClient.js', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
  isSupabaseConfigured: true,
}))

import * as supabaseClient from './supabaseClient.js'

const MOCK_USER_ID = 'test-user-123'
const LESSON_ID = 'history-001'
const NOW = '2026-10-15T14:30:00Z'

const existingRow = {
  id: 'progress-1',
  student_id: MOCK_USER_ID,
  lesson_id: LESSON_ID,
  status: 'in_progress',
  completed_at: null,
  last_accessed_at: NOW,
  attempts_count: 1,
  metadata: {},
  created_at: NOW,
  updated_at: NOW,
}

// Records each chained call and resolves to the queued result
function queryFor(result) {
  const calls = []
  const query = {
    calls,
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  }
  for (const method of ['select', 'insert', 'update', 'delete', 'eq', 'single']) {
    query[method] = vi.fn((...args) => {
      calls.push([method, ...args])
      return query
    })
  }
  return query
}

function queueQueries(...results) {
  const queries = []
  supabaseClient.supabase.from.mockImplementation(() => {
    const query = queryFor(results.shift())
    queries.push(query)
    return query
  })
  return queries
}

function callsOf(query, method) {
  return query.calls.filter(([name]) => name === method)
}

describe('lesson_progress migration security model', () => {
  it('enables row level security on lesson_progress', () => {
    expect(migrationSql).toContain('ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;')
  })

  it('revokes default access from PUBLIC, anon, and authenticated before granting', () => {
    expect(statementsStartingWith('REVOKE ALL ON TABLE public.lesson_progress')).toEqual([
      'REVOKE ALL ON TABLE public.lesson_progress FROM PUBLIC, anon, authenticated',
    ])
  })

  it('grants authenticated only SELECT and DELETE at table level, plus column-level INSERT and UPDATE', () => {
    expect(statementsStartingWith('GRANT')).toEqual([
      'GRANT SELECT, DELETE ON TABLE public.lesson_progress TO authenticated',
      'GRANT INSERT (student_id, lesson_id, status, completed_at, last_accessed_at, attempts_count, metadata) ON TABLE public.lesson_progress TO authenticated',
      'GRANT UPDATE (status, completed_at, last_accessed_at, attempts_count, metadata) ON TABLE public.lesson_progress TO authenticated',
    ])
  })

  it('never grants authenticated server-owned columns on INSERT or UPDATE', () => {
    for (const column of ['id', 'created_at', 'updated_at']) {
      expect(INSERT_COLUMNS).not.toContain(column)
    }
    for (const column of ['id', 'created_at', 'updated_at', 'student_id', 'lesson_id']) {
      expect(UPDATE_COLUMNS).not.toContain(column)
    }
  })

  it('defines exactly four policies, each limited to the owning student', () => {
    expect(statementsStartingWith('CREATE POLICY')).toEqual([
      'CREATE POLICY lesson_progress_select_own ON public.lesson_progress FOR SELECT TO authenticated USING (student_id = auth.uid())',
      'CREATE POLICY lesson_progress_insert_own ON public.lesson_progress FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid())',
      'CREATE POLICY lesson_progress_update_own ON public.lesson_progress FOR UPDATE TO authenticated USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid())',
      'CREATE POLICY lesson_progress_delete_own ON public.lesson_progress FOR DELETE TO authenticated USING (student_id = auth.uid())',
    ])
  })

  it('keeps updated_at maintained by a trigger, not by the client', () => {
    expect(migrationSql).toContain('CREATE TRIGGER lesson_progress_update_timestamp')
    expect(migrationSql).toContain('BEFORE UPDATE ON public.lesson_progress')
  })
})

describe('progressService writes stay inside the granted columns', () => {
  const MOCK_SESSION = { data: { session: { user: { id: MOCK_USER_ID } } } }

  beforeEach(() => {
    vi.clearAllMocks()
    supabaseClient.supabase.from.mockReset()
    supabaseClient.supabase.auth.getSession.mockResolvedValue(MOCK_SESSION)
  })

  it('insert payload uses only granted INSERT columns and the signed-in student id', async () => {
    const noRow = { data: null, error: { code: 'PGRST116', message: 'no rows' } }
    const queries = queueQueries(noRow, { data: [existingRow], error: null })

    await progressService.saveProgress(LESSON_ID, 'in_progress', {})

    const payload = callsOf(queries[1], 'insert')[0][1]
    expect(Object.keys(payload).every((column) => INSERT_COLUMNS.includes(column))).toBe(true)
    expect(payload.student_id).toBe(MOCK_USER_ID)
  })

  it('saveProgress update payload uses only granted UPDATE columns and is scoped to the student', async () => {
    const queries = queueQueries(
      { data: existingRow, error: null },
      { data: [existingRow], error: null },
    )

    await progressService.saveProgress(LESSON_ID, 'completed', {})

    const payload = callsOf(queries[1], 'update')[0][1]
    expect(Object.keys(payload).every((column) => UPDATE_COLUMNS.includes(column))).toBe(true)
    expect(callsOf(queries[1], 'eq')).toContainEqual(['eq', 'student_id', MOCK_USER_ID])
  })

  it('resetProgress update payload uses only granted UPDATE columns and is scoped to the student', async () => {
    const queries = queueQueries({ data: null, error: null })

    await progressService.resetProgress(LESSON_ID)

    const payload = callsOf(queries[0], 'update')[0][1]
    expect(Object.keys(payload).every((column) => UPDATE_COLUMNS.includes(column))).toBe(true)
    expect(callsOf(queries[0], 'eq')).toContainEqual(['eq', 'student_id', MOCK_USER_ID])
  })

  it('permanentlyDeleteAllProgress deletes only the signed-in student rows', async () => {
    const queries = queueQueries({ data: null, error: null })

    await progressService.permanentlyDeleteAllProgress()

    expect(callsOf(queries[0], 'delete')).toHaveLength(1)
    expect(callsOf(queries[0], 'eq')).toEqual([['eq', 'student_id', MOCK_USER_ID]])
  })

  // Known gap, not covered by a passing test. An in-flight save that loses a race to a reset now
  // stops (see progressService.test.js). A stale tab that saves after a reset still writes, because
  // the save reads the reset row as its starting point. Closing that needs a database version check.
  it.todo('a stale tab cannot save over a reset it has not seen')
})
