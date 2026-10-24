import { describe, it, expect } from 'vitest'
import { isLessonAvailable } from './lessonAvailability.js'

describe('isLessonAvailable', () => {
  const lessons = [{ id: 'history-001' }, { id: 'history-002' }]
  const content = { 'history-001': { steps: [] }, 'history-002': { steps: [] } }

  it('is true for a lesson that is in the curriculum and has content', () => {
    expect(isLessonAvailable('history-001')).toBe(true)
  })

  it('is false when no lesson is attached to the milestone', () => {
    expect(isLessonAvailable(null)).toBe(false)
    expect(isLessonAvailable(undefined)).toBe(false)
  })

  it('is false for an ID that is not in the curriculum', () => {
    expect(isLessonAvailable('history-999')).toBe(false)
  })

  it('is false for a curriculum lesson that has no content yet', () => {
    expect(isLessonAvailable('history-002', lessons, { 'history-001': {} })).toBe(false)
  })

  it('becomes true for a new milestone lesson once it is in both registries', () => {
    expect(isLessonAvailable('history-002', lessons, content)).toBe(true)
  })
})
