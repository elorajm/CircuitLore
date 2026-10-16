import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as progressService from './progressService.js'
import LESSONS from '../constants/lessons.js'

// Mock the Supabase client - MUST be at top level before describe blocks
vi.mock('./supabaseClient.js', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  },
  isSupabaseConfigured: true,
}))

// Import after mock is declared
import * as supabaseClient from './supabaseClient.js'

const MOCK_USER_ID = 'test-user-123'
const LESSON_ID = 'history-001'
const NOW = '2026-10-15T14:30:00Z'
const LATER = '2026-10-15T15:00:00Z'

function progressRow(overrides = {}) {
  return {
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
    ...overrides,
  }
}

// Each supabase.from() call gets a query builder that records its calls and resolves to the next queued result
function createQuery(result) {
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
    const query = createQuery(results.shift())
    queries.push(query)
    return query
  })
  return queries
}

function callsOf(query, method) {
  return query.calls.filter(([name]) => name === method)
}

const noRow = { data: null, error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' } }
const foundRow = (row) => ({ data: row, error: null })
const updatedRow = (row) => ({ data: [row], error: null })
const noUpdatedRow = { data: [], error: null }

describe('progressService', () => {
  const MOCK_SESSION = {
    data: {
      session: {
        user: { id: MOCK_USER_ID },
      },
    },
  }

  const MOCK_PROGRESS_RECORD = progressRow()

  beforeEach(() => {
    vi.clearAllMocks()
    supabaseClient.supabase.from.mockReset()
    // Default: authenticated session
    supabaseClient.supabase.auth.getSession.mockResolvedValue(MOCK_SESSION)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('saveProgress', () => {
    describe('attempt counting', () => {
      it('inserts a new row with attempts_count 1 on first start', async () => {
        const queries = queueQueries(noRow, updatedRow(MOCK_PROGRESS_RECORD))

        const result = await progressService.saveProgress(LESSON_ID, 'in_progress', {})

        expect(result).toEqual(MOCK_PROGRESS_RECORD)
        expect(queries).toHaveLength(2)
        expect(callsOf(queries[1], 'insert')[0][1]).toEqual(
          expect.objectContaining({
            student_id: MOCK_USER_ID,
            lesson_id: LESSON_ID,
            status: 'in_progress',
            attempts_count: 1,
          }),
        )
        expect(callsOf(queries[1], 'update')).toHaveLength(0)
      })

      it('inserts a first-time completion as attempt 1 with completed_at set', async () => {
        const queries = queueQueries(noRow, updatedRow(MOCK_PROGRESS_RECORD))

        await progressService.saveProgress(LESSON_ID, 'completed', {})

        const payload = callsOf(queries[1], 'insert')[0][1]
        expect(payload.attempts_count).toBe(1)
        expect(payload.completed_at).toEqual(expect.any(String))
      })

      it('inserts a not_started row with attempts_count 0', async () => {
        const queries = queueQueries(noRow, updatedRow(MOCK_PROGRESS_RECORD))

        await progressService.saveProgress(LESSON_ID, 'not_started', {})

        expect(callsOf(queries[1], 'insert')[0][1].attempts_count).toBe(0)
      })

      it('does not increment attempts when an in-progress lesson is saved again', async () => {
        const existing = progressRow({ status: 'in_progress', attempts_count: 1 })
        const queries = queueQueries(foundRow(existing), updatedRow(existing))

        await progressService.saveProgress(LESSON_ID, 'in_progress', {})

        const payload = callsOf(queries[1], 'update')[0][1]
        expect(payload.attempts_count).toBe(1)
        expect(payload).not.toHaveProperty('student_id')
        expect(payload).not.toHaveProperty('lesson_id')
        expect(payload).not.toHaveProperty('id')
      })

      it('does not increment attempts when an in-progress lesson is completed', async () => {
        const existing = progressRow({ status: 'in_progress', attempts_count: 1 })
        const queries = queueQueries(
          foundRow(existing),
          updatedRow(progressRow({ status: 'completed' })),
        )

        await progressService.saveProgress(LESSON_ID, 'completed', {})

        const payload = callsOf(queries[1], 'update')[0][1]
        expect(payload.status).toBe('completed')
        expect(payload.attempts_count).toBe(1)
        expect(payload.completed_at).toEqual(expect.any(String))
      })

      it('keeps the original completed_at and attempts when a completed lesson is saved again', async () => {
        const existing = progressRow({
          status: 'completed',
          attempts_count: 2,
          completed_at: LATER,
        })
        const queries = queueQueries(foundRow(existing), updatedRow(existing))

        await progressService.saveProgress(LESSON_ID, 'completed', {})

        const payload = callsOf(queries[1], 'update')[0][1]
        expect(payload.attempts_count).toBe(2)
        expect(payload.completed_at).toBe(LATER)
      })

      it('increments attempts when a completed lesson is restarted', async () => {
        const existing = progressRow({
          status: 'completed',
          attempts_count: 2,
          completed_at: LATER,
        })
        const queries = queueQueries(
          foundRow(existing),
          updatedRow(progressRow({ status: 'in_progress', attempts_count: 3 })),
        )

        await progressService.saveProgress(LESSON_ID, 'in_progress', {})

        const payload = callsOf(queries[1], 'update')[0][1]
        expect(payload.status).toBe('in_progress')
        expect(payload.attempts_count).toBe(3)
        expect(payload.completed_at).toBeNull()
      })

      it('counts a new attempt when a reset lesson is started again', async () => {
        const existing = progressRow({ status: 'not_started', attempts_count: 2 })
        const queries = queueQueries(foundRow(existing), updatedRow(progressRow({ attempts_count: 3 })))

        await progressService.saveProgress(LESSON_ID, 'in_progress', {})

        expect(callsOf(queries[1], 'update')[0][1].attempts_count).toBe(3)
      })

      it('does not increment attempts when a not_started row is saved as not_started', async () => {
        const existing = progressRow({ status: 'not_started', attempts_count: 2 })
        const queries = queueQueries(foundRow(existing), updatedRow(existing))

        await progressService.saveProgress(LESSON_ID, 'not_started', {})

        expect(callsOf(queries[1], 'update')[0][1].attempts_count).toBe(2)
      })

      it('guards the update with the status and attempts_count that were read', async () => {
        const existing = progressRow({ status: 'in_progress', attempts_count: 4 })
        const queries = queueQueries(foundRow(existing), updatedRow(existing))

        await progressService.saveProgress(LESSON_ID, 'in_progress', {})

        const filters = callsOf(queries[1], 'eq')
        expect(filters).toEqual(
          expect.arrayContaining([
            ['eq', 'student_id', MOCK_USER_ID],
            ['eq', 'lesson_id', LESSON_ID],
            ['eq', 'status', 'in_progress'],
            ['eq', 'attempts_count', 4],
          ]),
        )
      })

      it('accepts metadata and stores it on update', async () => {
        const metadata = { quiz_score: 85, time_spent_seconds: 600 }
        const existing = progressRow()
        const queries = queueQueries(foundRow(existing), updatedRow({ ...existing, metadata }))

        const result = await progressService.saveProgress(LESSON_ID, 'in_progress', metadata)

        expect(callsOf(queries[1], 'update')[0][1].metadata).toEqual(metadata)
        expect(result.metadata).toEqual(metadata)
      })

      it('leaves stored metadata untouched on update when metadata is omitted', async () => {
        const existing = progressRow({ metadata: { quiz_score: 85 } })
        const queries = queueQueries(foundRow(existing), updatedRow(existing))

        await progressService.saveProgress(LESSON_ID, 'completed')

        expect(callsOf(queries[1], 'update')[0][1]).not.toHaveProperty('metadata')
      })

      it('replaces stored metadata with an empty object only when explicitly passed', async () => {
        const existing = progressRow({ metadata: { quiz_score: 85 } })
        const queries = queueQueries(foundRow(existing), updatedRow(existing))

        await progressService.saveProgress(LESSON_ID, 'in_progress', {})

        expect(callsOf(queries[1], 'update')[0][1].metadata).toEqual({})
      })

      it('does not send metadata on insert when it is omitted', async () => {
        const queries = queueQueries(noRow, updatedRow(MOCK_PROGRESS_RECORD))

        await progressService.saveProgress(LESSON_ID, 'in_progress')

        expect(callsOf(queries[1], 'insert')[0][1]).not.toHaveProperty('metadata')
      })

      it('stores supplied metadata on insert', async () => {
        const metadata = { quiz_score: 90 }
        const queries = queueQueries(noRow, updatedRow(MOCK_PROGRESS_RECORD))

        await progressService.saveProgress(LESSON_ID, 'completed', metadata)

        expect(callsOf(queries[1], 'insert')[0][1].metadata).toEqual(metadata)
      })

      it('rejects explicit null metadata instead of treating it as omitted', async () => {
        await expect(progressService.saveProgress(LESSON_ID, 'in_progress', null)).rejects.toThrow(
          'Metadata must be an object',
        )
      })
    })

    describe('concurrency', () => {
      it('retries when the row changed between read and update', async () => {
        const stale = progressRow({ attempts_count: 1 })
        const fresh = progressRow({ attempts_count: 2 })
        const queries = queueQueries(
          foundRow(stale),
          noUpdatedRow,
          foundRow(fresh),
          updatedRow(fresh),
        )

        const result = await progressService.saveProgress(LESSON_ID, 'in_progress', {})

        expect(result).toEqual(fresh)
        expect(queries).toHaveLength(4)
        expect(callsOf(queries[3], 'eq')).toContainEqual(['eq', 'attempts_count', 2])
      })

      it('retries as an update when another save inserted the row first', async () => {
        const raced = progressRow({ attempts_count: 1 })
        const queries = queueQueries(
          noRow,
          { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint' } },
          foundRow(raced),
          updatedRow(raced),
        )

        const result = await progressService.saveProgress(LESSON_ID, 'in_progress', {})

        expect(result).toEqual(raced)
        expect(queries).toHaveLength(4)
        expect(callsOf(queries[3], 'update')).toHaveLength(1)
      })

      it('throws a clear error after repeated conflicts', async () => {
        const row = progressRow({ attempts_count: 1 })
        queueQueries(
          foundRow(row), noUpdatedRow,
          foundRow(row), noUpdatedRow,
          foundRow(row), noUpdatedRow,
        )

        await expect(progressService.saveProgress(LESSON_ID, 'in_progress')).rejects.toThrow(
          'changed during save',
        )
      })
    })

    describe('errors', () => {
      it('throws when reading the existing row fails', async () => {
        queueQueries({ data: null, error: { code: 'OTHER', message: 'Database error' } })

        await expect(progressService.saveProgress(LESSON_ID, 'in_progress')).rejects.toThrow(
          'Failed to fetch lesson progress: Database error',
        )
      })

      it('throws when insert fails for a reason other than a conflict', async () => {
        queueQueries(noRow, { data: null, error: { code: '42501', message: 'permission denied' } })

        await expect(progressService.saveProgress(LESSON_ID, 'in_progress')).rejects.toThrow(
          'Failed to save progress: permission denied',
        )
      })

      it('throws when update fails', async () => {
        queueQueries(
          foundRow(progressRow()),
          { data: null, error: { code: '42501', message: 'permission denied for table lesson_progress' } },
        )

        await expect(progressService.saveProgress(LESSON_ID, 'completed')).rejects.toThrow(
          'Failed to save progress: permission denied',
        )
      })
    })

    it('should throw error if user not authenticated', async () => {
      supabaseClient.supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      await expect(progressService.saveProgress(LESSON_ID, 'in_progress')).rejects.toThrow(
        'not authenticated',
      )
    })

    it('should throw error if invalid status provided', async () => {
      await expect(
        progressService.saveProgress(LESSON_ID, 'invalid_status'),
      ).rejects.toThrow('Invalid status')
    })

    it('should throw error if lessonId is empty', async () => {
      await expect(progressService.saveProgress('', 'in_progress')).rejects.toThrow(
        'lessonId must be a non-empty string',
      )
    })

    it('should throw error if metadata is not an object', async () => {
      await expect(progressService.saveProgress(LESSON_ID, 'in_progress', 'not-object')).rejects.toThrow(
        'Metadata must be an object',
      )
    })
  })

  describe('getProgress', () => {
    it('should retrieve all progress records for authenticated user', async () => {
      const mockRecords = [MOCK_PROGRESS_RECORD, { ...MOCK_PROGRESS_RECORD, lesson_id: 'history-002' }]

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockRecords,
            error: null,
          }),
        }),
      })

      supabaseClient.supabase.from.mockReturnValue({
        select: mockSelect,
      })

      const result = await progressService.getProgress()

      expect(result).toHaveLength(2)
      expect(result[0].lesson_id).toBe('history-001')
    })

    it('should return empty array when no progress records', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      })

      supabaseClient.supabase.from.mockReturnValue({
        select: mockSelect,
      })

      const result = await progressService.getProgress()

      expect(result).toEqual([])
    })

    it('should throw error on database error', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      })

      supabaseClient.supabase.from.mockReturnValue({
        select: mockSelect,
      })

      await expect(progressService.getProgress()).rejects.toThrow('Failed to fetch progress')
    })

    it('should throw error if user not authenticated', async () => {
      supabaseClient.supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      await expect(progressService.getProgress()).rejects.toThrow('not authenticated')
    })
  })

  describe('getLessonProgress', () => {
    it('should retrieve progress for specific lesson', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: MOCK_PROGRESS_RECORD,
        error: null,
      })

      const mockEq = vi.fn()
      mockEq.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      })

      supabaseClient.supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      })

      const result = await progressService.getLessonProgress(LESSON_ID)

      expect(result).toEqual(MOCK_PROGRESS_RECORD)
    })

    it('should return null when lesson not started', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // Supabase error for no rows found
      })

      const mockEq = vi.fn()
      mockEq.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      })

      supabaseClient.supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      })

      const result = await progressService.getLessonProgress(LESSON_ID)

      expect(result).toBeNull()
    })

    it('should throw error on other database errors', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'OTHER_ERROR', message: 'Database error' },
      })

      const mockEq = vi.fn()
      mockEq.mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      })

      supabaseClient.supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      })

      await expect(progressService.getLessonProgress(LESSON_ID)).rejects.toThrow(
        'Failed to fetch lesson progress',
      )
    })

    it('should throw error if user not authenticated', async () => {
      supabaseClient.supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      await expect(progressService.getLessonProgress(LESSON_ID)).rejects.toThrow('not authenticated')
    })
  })

  describe('getProgressSummary', () => {
    it('should calculate progress percentage correctly', async () => {
      const completedLessons = [
        { status: 'completed' },
        { status: 'completed' },
        { status: 'completed' },
      ]

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: completedLessons,
            error: null,
          }),
        }),
      })

      supabaseClient.supabase.from.mockReturnValue({
        select: mockSelect,
      })

      const result = await progressService.getProgressSummary()

      expect(result.completed).toBe(3)
      expect(result.total).toBe(LESSONS.length)
      expect(result.percentage).toBe(Math.round((3 / LESSONS.length) * 100))
    })

    it('should return 0% when no lessons completed', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      })

      supabaseClient.supabase.from.mockReturnValue({
        select: mockSelect,
      })

      const result = await progressService.getProgressSummary()

      expect(result.completed).toBe(0)
      expect(result.percentage).toBe(0)
    })

    it('should return 100% when all lessons completed', async () => {
      const completedLessons = LESSONS.map(() => ({ status: 'completed' }))

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: completedLessons,
            error: null,
          }),
        }),
      })

      supabaseClient.supabase.from.mockReturnValue({
        select: mockSelect,
      })

      const result = await progressService.getProgressSummary()

      expect(result.completed).toBe(LESSONS.length)
      expect(result.percentage).toBe(100)
    })

    it('should throw error if user not authenticated', async () => {
      supabaseClient.supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      await expect(progressService.getProgressSummary()).rejects.toThrow('not authenticated')
    })

    it('should throw error on database error', async () => {
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      })

      supabaseClient.supabase.from.mockReturnValue({
        select: mockSelect,
      })

      await expect(progressService.getProgressSummary()).rejects.toThrow('Failed to fetch progress summary')
    })
  })

  describe('resetProgress', () => {
    it('returns the lesson to not_started and keeps attempts_count', async () => {
      const queries = queueQueries({ data: null, error: null })

      const result = await progressService.resetProgress(LESSON_ID)

      expect(result.success).toBe(true)
      expect(result.message).toContain(LESSON_ID)
      expect(callsOf(queries[0], 'update')[0][1]).toEqual({
        status: 'not_started',
        completed_at: null,
        metadata: {},
      })
      expect(callsOf(queries[0], 'delete')).toHaveLength(0)
    })

    it('scopes the reset to the authenticated student and lesson', async () => {
      const queries = queueQueries({ data: null, error: null })

      await progressService.resetProgress(LESSON_ID)

      expect(callsOf(queries[0], 'eq')).toEqual([
        ['eq', 'student_id', MOCK_USER_ID],
        ['eq', 'lesson_id', LESSON_ID],
      ])
    })

    it('should throw error if lessonId is empty', async () => {
      await expect(progressService.resetProgress('')).rejects.toThrow('lessonId must be a non-empty string')
    })

    it('should throw error if user not authenticated', async () => {
      supabaseClient.supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      await expect(progressService.resetProgress(LESSON_ID)).rejects.toThrow('not authenticated')
    })

    it('should throw error on database error', async () => {
      queueQueries({ data: null, error: { message: 'Database error' } })

      await expect(progressService.resetProgress(LESSON_ID)).rejects.toThrow('Failed to reset progress')
    })
  })

  describe('resetAllProgress', () => {
    it('restarts every lesson and keeps attempts_count', async () => {
      const queries = queueQueries({ data: null, error: null })

      const result = await progressService.resetAllProgress()

      expect(result.success).toBe(true)
      expect(result.message).toContain('All progress')
      expect(callsOf(queries[0], 'update')[0][1]).toEqual({
        status: 'not_started',
        completed_at: null,
        metadata: {},
      })
      expect(callsOf(queries[0], 'update')[0][1]).not.toHaveProperty('attempts_count')
      expect(callsOf(queries[0], 'delete')).toHaveLength(0)
    })

    it('scopes the restart to the authenticated student only', async () => {
      const queries = queueQueries({ data: null, error: null })

      await progressService.resetAllProgress()

      expect(callsOf(queries[0], 'eq')).toEqual([['eq', 'student_id', MOCK_USER_ID]])
    })

    it('should throw error if user not authenticated', async () => {
      supabaseClient.supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      await expect(progressService.resetAllProgress()).rejects.toThrow('not authenticated')
    })

    it('should throw error on database error', async () => {
      queueQueries({ data: null, error: { message: 'Database error' } })

      await expect(progressService.resetAllProgress()).rejects.toThrow('Failed to reset all progress')
    })
  })

  describe('permanentlyDeleteAllProgress', () => {
    it('deletes all progress rows for the authenticated student', async () => {
      const queries = queueQueries({ data: null, error: null })

      const result = await progressService.permanentlyDeleteAllProgress()

      expect(result.success).toBe(true)
      expect(result.message).toContain('permanently deleted')
      expect(callsOf(queries[0], 'delete')).toHaveLength(1)
      expect(callsOf(queries[0], 'eq')).toEqual([['eq', 'student_id', MOCK_USER_ID]])
      expect(callsOf(queries[0], 'update')).toHaveLength(0)
    })

    it('should throw error if user not authenticated', async () => {
      supabaseClient.supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      await expect(progressService.permanentlyDeleteAllProgress()).rejects.toThrow('not authenticated')
    })

    it('should throw error on database error', async () => {
      queueQueries({ data: null, error: { message: 'Database error' } })

      await expect(progressService.permanentlyDeleteAllProgress()).rejects.toThrow('Failed to delete progress')
    })
  })

  describe('authentication handling', () => {
    it('should handle missing session gracefully', async () => {
      supabaseClient.supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const testFunctions = [
        progressService.saveProgress,
        progressService.getProgress,
        progressService.getLessonProgress,
        progressService.getProgressSummary,
        progressService.resetProgress,
        progressService.resetAllProgress,
        progressService.permanentlyDeleteAllProgress,
      ]

      for (const func of testFunctions) {
        await expect(func(LESSON_ID)).rejects.toThrow('not authenticated')
      }
    })
  })

  describe('data validation', () => {
    it('should validate lesson IDs', async () => {
      const invalidIds = [null, undefined, '', 123, {}]

      for (const id of invalidIds) {
        await expect(progressService.saveProgress(id, 'in_progress')).rejects.toThrow()
      }
    })

    it('should validate status values', async () => {
      const invalidStatuses = ['invalid', 'started', 'done', 'maybe', '']

      for (const status of invalidStatuses) {
        await expect(progressService.saveProgress(LESSON_ID, status)).rejects.toThrow('Invalid status')
      }
    })

    it('should accept all valid statuses', async () => {
      const statuses = ['not_started', 'in_progress', 'completed']
      queueQueries(...statuses.flatMap(() => [noRow, updatedRow(MOCK_PROGRESS_RECORD)]))

      for (const status of statuses) {
        await expect(progressService.saveProgress(LESSON_ID, status)).resolves.toBeDefined()
      }
    })
  })
})
