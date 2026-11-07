import { describe, it, expect } from 'vitest'
import timelineMilestones from './timeline.js'
import LESSONS from '../../constants/lessons.js'
import lessonContent from '../lessonContent.js'
import { isLessonAvailable } from './lessonAvailability.js'
import { historyConnectionsForLesson, playableLessonsForMilestone } from './connections.js'

const EXISTING_LESSONS = ['history-001', 'concept-001', 'concept-002']

function milestone(id) {
  return timelineMilestones.find((item) => item.id === id)
}

describe('historical connections', () => {
  it('keeps all fifteen timeline milestones', () => {
    expect(timelineMilestones).toHaveLength(15)
  })

  it('only links milestones to lessons that exist and have content', () => {
    for (const item of timelineMilestones) {
      for (const related of item.relatedLessons ?? []) {
        expect(LESSONS.some((lesson) => lesson.id === related.lessonId)).toBe(true)
        expect(lessonContent[related.lessonId]).toBeDefined()
        expect(related.note).toEqual(expect.any(String))
      }
    }
  })

  it('gives every existing lesson at least one historical connection', () => {
    for (const lessonId of EXISTING_LESSONS) {
      expect(historyConnectionsForLesson(lessonId).length).toBeGreaterThan(0)
    }
  })

  it('keeps the first milestone as the primary link to Electricity Mysteries', () => {
    const connections = historyConnectionsForLesson('history-001')

    expect(connections[0].milestone.id).toBe('thales-amber')
    expect(connections[0].note).toBeNull()
    expect(connections.map((connection) => connection.milestone.id)).toContain('gilbert-electric')
  })

  it('connects the charge lesson to the discoveries about charge', () => {
    const ids = historyConnectionsForLesson('concept-001').map((connection) => connection.milestone.id)

    expect(ids).toEqual(
      expect.arrayContaining(['guericke-sulfur-ball', 'du-fay-two-kinds', 'franklin-lightning', 'thomson-electron']),
    )
  })

  it('connects the current lesson to the discoveries about conductors and steady current', () => {
    const ids = historyConnectionsForLesson('concept-002').map((connection) => connection.milestone.id)

    expect(ids).toEqual(expect.arrayContaining(['gray-conductors', 'volta-pile', 'thomson-electron']))
  })

  it('never returns a lesson that is not built as a playable related lesson', () => {
    const fake = { id: 'fake', relatedLessons: [{ lessonId: 'history-999', note: 'Not built' }] }

    expect(playableLessonsForMilestone(fake)).toEqual([])
    expect(isLessonAvailable('history-999')).toBe(false)
  })

  it('connects Electricity at Home to Faraday, Tesla, and Edison, and only those', () => {
    const ids = historyConnectionsForLesson('modern-001').map((connection) => connection.milestone.id)

    expect(ids.sort()).toEqual(['edison-lamp', 'faraday-induction', 'tesla-ac-motor'])
  })

  it('offers Electricity at Home from each of those milestones now that the lesson is playable', () => {
    for (const id of ['faraday-induction', 'tesla-ac-motor', 'edison-lamp']) {
      expect(playableLessonsForMilestone(milestone(id)).map((lesson) => lesson.lessonId)).toEqual(['modern-001'])
    }
  })

  it('credits the AC systems to more than Tesla, and the lamp to a lighting system, in the Electricity at Home notes', () => {
    const notes = Object.fromEntries(
      historyConnectionsForLesson('modern-001').map((connection) => [connection.milestone.id, connection.note]),
    )

    expect(notes['tesla-ac-motor']).toMatch(/licensed through Westinghouse/)
    expect(notes['edison-lamp']).toMatch(/lamp and lighting system/)
    expect(notes['faraday-induction']).toMatch(/discovered induction/)
  })

  it('returns playable related lessons with their titles for a milestone', () => {
    expect(playableLessonsForMilestone(milestone('thomson-electron'))).toEqual([
      expect.objectContaining({ lessonId: 'concept-001', title: 'Electric Charge' }),
      expect.objectContaining({ lessonId: 'concept-002', title: 'Electric Current' }),
    ])
  })
})
