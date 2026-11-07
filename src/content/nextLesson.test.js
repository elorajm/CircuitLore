import { describe, it, expect } from 'vitest'
import { chooseNextLessonId } from './nextLesson.js'

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
