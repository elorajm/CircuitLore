import { describe, it, expect } from 'vitest'
import timelineMilestones from './timeline.js'
import LESSONS from '../../constants/lessons.js'
import lessonContent from '../lessonContent.js'

function centuryOf(year) {
  return Math.ceil(year / 100)
}

describe('history timeline milestones', () => {
  it('includes at least fifteen milestones in chronological order', () => {
    expect(timelineMilestones.length).toBeGreaterThanOrEqual(15)

    const years = timelineMilestones.map((milestone) => milestone.year)
    expect(years).toEqual([...years].sort((a, b) => a - b))
  })

  it('starts with an ancient observation and ends with a modern discovery', () => {
    expect(timelineMilestones[0].year).toBeLessThan(0)
    expect(timelineMilestones[timelineMilestones.length - 1].year).toBeGreaterThanOrEqual(1950)
  })

  it('covers the 1st century CE and every century from the 17th to the 20th', () => {
    const centuries = new Set(timelineMilestones.map((milestone) => centuryOf(milestone.year)))

    for (const century of [1, 17, 18, 19, 20]) {
      expect(centuries).toContain(century)
    }
  })

  it('gives every milestone unique ids and the required student-facing fields', () => {
    const ids = timelineMilestones.map((milestone) => milestone.id)
    expect(new Set(ids).size).toBe(ids.length)

    for (const milestone of timelineMilestones) {
      expect(milestone.id).toMatch(/^[a-z0-9-]+$/)
      expect(milestone.displayDate).toBeTruthy()
      expect(milestone.person).toBeTruthy()
      expect(milestone.shortName).toBeTruthy()
      expect(milestone.summary).toBeTruthy()
      expect(milestone.modernLink).toBeTruthy()
      expect(milestone.nextHook).toBeTruthy()
    }
  })

  it('tells each milestone as a short story of three or more paragraphs', () => {
    for (const milestone of timelineMilestones) {
      expect(milestone.story.length).toBeGreaterThanOrEqual(3)
      for (const paragraph of milestone.story) {
        expect(paragraph.split(/\s+/).length).toBeLessThanOrEqual(60)
      }
    }
  })

  it('documents at least one source for every milestone', () => {
    for (const milestone of timelineMilestones) {
      expect(milestone.sources.length).toBeGreaterThan(0)
      for (const source of milestone.sources) {
        expect(source.label).toBeTruthy()
        if (source.url) expect(source.url).toMatch(/^https:\/\//)
      }
    }
  })

  it('does not credit Tesla with inventing the electric motor', () => {
    const tesla = timelineMilestones.find((milestone) => milestone.id === 'tesla-ac-motor')
    expect(JSON.stringify(tesla)).not.toMatch(/invented the (first )?(electric )?motor/i)
  })

  it('links only to lessons that exist in the curriculum', () => {
    const lessonIds = LESSONS.map((lesson) => lesson.id)

    for (const milestone of timelineMilestones) {
      if (milestone.lessonId) {
        expect(lessonIds).toContain(milestone.lessonId)
        expect(lessonContent[milestone.lessonId]).toBeDefined()
      }
    }
  })

  it('connects the first milestone to the Electricity Mysteries lesson', () => {
    expect(timelineMilestones[0].lessonId).toBe('history-001')
  })
})
