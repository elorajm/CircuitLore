import { describe, it, expect } from 'vitest'
import { chooseNextLessonId, nextPlayableLesson } from './nextLesson.js'

const first = { id: 'history-001', order: 1 }
const second = { id: 'concept-001', order: 8 }
const playable = [second, first]

function row(lessonId, status, lastAccessedAt = null) {
  return { lesson_id: lessonId, status, last_accessed_at: lastAccessedAt }
}

describe('chooseNextLessonId', () => {
  it('starts with the first playable lesson when there is no saved progress', () => {
    expect(chooseNextLessonId([], playable)).toBe('history-001')
  })

  it('continues the in-progress lesson the student saved most recently', () => {
    const rows = [
      row('history-001', 'in_progress', '2026-11-01T10:00:00Z'),
      row('concept-001', 'in_progress', '2026-11-02T10:00:00Z'),
    ]

    expect(chooseNextLessonId(rows, playable)).toBe('concept-001')
  })

  it('moves on to the next lesson after the first is completed', () => {
    expect(chooseNextLessonId([row('history-001', 'completed')], playable)).toBe('concept-001')
  })

  it('returns to an in-progress lesson before starting a new one', () => {
    const rows = [row('history-001', 'in_progress', '2026-11-01T10:00:00Z'), row('concept-001', 'not_started')]

    expect(chooseNextLessonId(rows, playable)).toBe('history-001')
  })

  it('treats a row reset to not_started as not yet completed', () => {
    expect(chooseNextLessonId([row('history-001', 'not_started')], playable)).toBe('history-001')
  })

  it('recommends the first playable lesson for review when every playable lesson is completed', () => {
    const rows = [row('history-001', 'completed'), row('concept-001', 'completed')]

    expect(chooseNextLessonId(rows, playable)).toBe('history-001')
  })

  it('ignores rows for lessons that are not playable', () => {
    const rows = [row('history-999', 'in_progress', '2026-11-03T10:00:00Z')]

    expect(chooseNextLessonId(rows, playable)).toBe('history-001')
  })

  it('returns null when no lesson is playable', () => {
    expect(chooseNextLessonId([], [])).toBeNull()
  })
})

describe('nextPlayableLesson', () => {
  const lessons = [
    { id: 'history-001', order: 1 },
    { id: 'concept-001', order: 8 },
    { id: 'concept-002', order: 9 },
  ]

  it('leads from one playable lesson to the next in curriculum order', () => {
    expect(nextPlayableLesson('history-001', lessons)?.id).toBe('concept-001')
    expect(nextPlayableLesson('concept-001', lessons)?.id).toBe('concept-002')
  })

  it('returns null after the last playable lesson', () => {
    expect(nextPlayableLesson('concept-002', lessons)).toBeNull()
  })

  it('returns null for a lesson that is not in the playable list', () => {
    expect(nextPlayableLesson('history-999', lessons)).toBeNull()
  })

  it('uses the real playable lessons by default: Electricity Mysteries leads to Electric Charge', () => {
    expect(nextPlayableLesson('history-001')?.id).toBe('concept-001')
    expect(nextPlayableLesson('concept-002')?.id).toBe('modern-001')
    expect(nextPlayableLesson('modern-001')).toBeNull()
  })
})
