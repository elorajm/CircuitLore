import { supabase, isSupabaseConfigured } from './supabaseClient.js'
import LESSONS from '../constants/lessons.js'

const PROGRESS_TABLE = 'lesson_progress'
const VALID_STATUSES = ['not_started', 'in_progress', 'completed']
const MAX_SAVE_ATTEMPTS = 3
const NO_ROWS_CODE = 'PGRST116'
const UNIQUE_VIOLATION_CODE = '23505'

/**
 * Throws an error if Supabase is not configured
 */
function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Cannot perform progress operations.')
  }
}

/**
 * Throws an error if user is not authenticated
 * Returns the authenticated user's ID
 */
async function getAuthenticatedUserId() {
  assertSupabaseConfigured()

  const { data, error } = await supabase.auth.getSession()
  if (error) {
    throw new Error(`Failed to get session: ${error.message}`)
  }

  const session = data?.session
  if (!session) {
    throw new Error('User is not authenticated')
  }

  return session.user.id
}

/**
 * A new attempt starts when a lesson is begun or completed from a state with no active attempt
 * (no row, not_started, or completed-then-restarted). Re-saving an active state does not count.
 */
function startsNewAttempt(previousStatus, nextStatus) {
  if (nextStatus === 'not_started') return false
  if (previousStatus === 'in_progress') return false
  if (previousStatus === 'completed') return nextStatus === 'in_progress'
  return true
}

async function fetchLessonRow(studentId, lessonId) {
  const { data, error } = await supabase
    .from(PROGRESS_TABLE)
    .select('*')
    .eq('student_id', studentId)
    .eq('lesson_id', lessonId)
    .single()

  if (error && error.code === NO_ROWS_CODE) {
    return null
  }

  if (error) {
    throw new Error(`Failed to fetch lesson progress: ${error.message}`)
  }

  return data
}

function buildProgressFields(existing, status, metadata) {
  const now = new Date().toISOString()
  const attemptIncrement = startsNewAttempt(existing?.status, status) ? 1 : 0

  const fields = {
    status,
    completed_at: status === 'completed' ? (existing?.completed_at ?? now) : null,
    last_accessed_at: now,
    attempts_count: (existing?.attempts_count ?? 0) + attemptIncrement,
  }

  if (metadata !== undefined) {
    fields.metadata = metadata
  }

  return fields
}

// Returns null if another request inserted the same row first (unique violation)
async function insertProgress(studentId, lessonId, fields) {
  const { data, error } = await supabase
    .from(PROGRESS_TABLE)
    .insert({ student_id: studentId, lesson_id: lessonId, ...fields })
    .select()

  if (error && error.code === UNIQUE_VIOLATION_CODE) {
    return null
  }

  if (error) {
    throw new Error(`Failed to save progress: ${error.message}`)
  }

  return data?.[0] ?? null
}

// Only writes columns the authenticated role may UPDATE; student_id and lesson_id are filters.
// Returns null if the row no longer matches the status and attempts_count that were read.
async function updateProgress(studentId, lessonId, existing, fields) {
  const { data, error } = await supabase
    .from(PROGRESS_TABLE)
    .update(fields)
    .eq('student_id', studentId)
    .eq('lesson_id', lessonId)
    .eq('status', existing.status)
    .eq('attempts_count', existing.attempts_count)
    .select()

  if (error) {
    throw new Error(`Failed to save progress: ${error.message}`)
  }

  return data?.[0] ?? null
}

/**
 * Saves or updates a student's progress for a lesson
 * Increments attempts_count only when a new attempt starts (see startsNewAttempt)
 *
 * Not a single atomic database operation. It reads the current row, then writes with a
 * compare-and-set: the update only applies if status and attempts_count still equal the values
 * that were read. A zero-row result (row changed, deleted, or not visible) is retried up to
 * MAX_SAVE_ATTEMPTS times. Both guard columns are NOT NULL, so `.eq` is a correct equality filter;
 * a nullable guard column would need `.is()` instead.
 *
 * @param {string} lessonId - The lesson identifier (e.g., 'history-001')
 * @param {string} status - Progress status: 'not_started', 'in_progress', or 'completed'
 * @param {object} [metadata] - Optional lesson-specific data. When omitted, stored metadata is left
 *   unchanged. When supplied, it replaces the stored metadata entirely (no merge).
 * @returns {Promise<object>} The saved/updated progress record
 * @throws {Error} If not authenticated, invalid input, or database error
 */
export async function saveProgress(lessonId, status = 'in_progress', metadata) {
  assertSupabaseConfigured()

  const studentId = await getAuthenticatedUserId()

  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`)
  }

  if (metadata !== undefined && (typeof metadata !== 'object' || metadata === null)) {
    throw new Error('Metadata must be an object')
  }

  if (!lessonId || typeof lessonId !== 'string') {
    throw new Error('lessonId must be a non-empty string')
  }

  for (let attempt = 0; attempt < MAX_SAVE_ATTEMPTS; attempt += 1) {
    const existing = await fetchLessonRow(studentId, lessonId)
    const fields = buildProgressFields(existing, status, metadata)
    const saved = existing
      ? await updateProgress(studentId, lessonId, existing, fields)
      : await insertProgress(studentId, lessonId, fields)

    if (saved) {
      return saved
    }
  }

  throw new Error('Failed to save progress: record changed during save, please retry')
}

/**
 * Retrieves all progress records for the authenticated student
 *
 * @returns {Promise<Array>} Array of progress records for the student
 * @throws {Error} If not authenticated or database error
 */
export async function getProgress() {
  assertSupabaseConfigured()

  const studentId = await getAuthenticatedUserId()

  const { data, error } = await supabase
    .from(PROGRESS_TABLE)
    .select('*')
    .eq('student_id', studentId)
    .order('lesson_id', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch progress: ${error.message}`)
  }

  return data || []
}

/**
 * Retrieves progress for a specific lesson for the authenticated student
 *
 * @param {string} lessonId - The lesson identifier
 * @returns {Promise<object|null>} The progress record or null if not started
 * @throws {Error} If not authenticated or database error
 */
export async function getLessonProgress(lessonId) {
  assertSupabaseConfigured()

  const studentId = await getAuthenticatedUserId()

  return fetchLessonRow(studentId, lessonId)
}

/**
 * Calculates overall progress as a percentage based on the defined curriculum
 * Returns the count of completed lessons and total lessons
 *
 * @returns {Promise<object>} { completed, total, percentage }
 * @throws {Error} If not authenticated or database error
 */
export async function getProgressSummary() {
  assertSupabaseConfigured()

  const studentId = await getAuthenticatedUserId()

  const { data, error } = await supabase
    .from(PROGRESS_TABLE)
    .select('status')
    .eq('student_id', studentId)
    .eq('status', 'completed')

  if (error) {
    throw new Error(`Failed to fetch progress summary: ${error.message}`)
  }

  const completed = data?.length || 0
  const total = LESSONS.length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return {
    completed,
    total,
    percentage,
  }
}

/**
 * Resets a student's progress for a specific lesson
 * Sets the lesson back to 'not_started' and clears completion time and metadata.
 * The row is kept so attempts_count (attempt history) survives the reset.
 *
 * @param {string} lessonId - The lesson identifier
 * @returns {Promise<object>} Confirmation of reset
 * @throws {Error} If not authenticated or database error
 */
export async function resetProgress(lessonId) {
  assertSupabaseConfigured()

  const studentId = await getAuthenticatedUserId()

  if (!lessonId || typeof lessonId !== 'string') {
    throw new Error('lessonId must be a non-empty string')
  }

  const { error } = await supabase
    .from(PROGRESS_TABLE)
    .update({ status: 'not_started', completed_at: null, metadata: {} })
    .eq('student_id', studentId)
    .eq('lesson_id', lessonId)

  if (error) {
    throw new Error(`Failed to reset progress: ${error.message}`)
  }

  return { success: true, message: `Progress reset for lesson ${lessonId}` }
}

/**
 * Restarts every lesson for the authenticated student
 * Sets each row to 'not_started' and clears its completion time and metadata.
 * Rows and attempts_count are kept, so attempt history survives.
 * Not coordinated with concurrent saves: a save running at the same time may land after the reset.
 *
 * @returns {Promise<object>} Confirmation of reset
 * @throws {Error} If not authenticated or database error
 */
export async function resetAllProgress() {
  assertSupabaseConfigured()

  const studentId = await getAuthenticatedUserId()

  const { error } = await supabase
    .from(PROGRESS_TABLE)
    .update({ status: 'not_started', completed_at: null, metadata: {} })
    .eq('student_id', studentId)

  if (error) {
    throw new Error(`Failed to reset all progress: ${error.message}`)
  }

  return { success: true, message: 'All progress has been reset' }
}

/**
 * Permanently deletes all progress rows for the authenticated student, including attempt history
 * Intended only for account deletion and privacy requests. It is not a student restart action.
 * The RLS DELETE policy lets any authenticated user delete their own rows, so keeping this off
 * student-facing UI is what prevents misuse; the database does not enforce it.
 *
 * @returns {Promise<object>} Confirmation of deletion
 * @throws {Error} If not authenticated or database error
 */
export async function permanentlyDeleteAllProgress() {
  assertSupabaseConfigured()

  const studentId = await getAuthenticatedUserId()

  const { error } = await supabase
    .from(PROGRESS_TABLE)
    .delete()
    .eq('student_id', studentId)

  if (error) {
    throw new Error(`Failed to delete progress: ${error.message}`)
  }

  return { success: true, message: 'All progress has been permanently deleted' }
}
