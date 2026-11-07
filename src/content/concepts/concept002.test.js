import { describe, it, expect } from 'vitest'
import concept002 from './concept002.js'
import LESSONS from '../../constants/lessons.js'
import lessonContent from '../lessonContent.js'
import { isLessonAvailable } from '../history/lessonAvailability.js'

const steps = concept002.steps

describe('concept-002 lesson content', () => {
  it('is registered in the curriculum and in the lesson content map', () => {
    expect(LESSONS.some((lesson) => lesson.id === 'concept-002')).toBe(true)
    expect(lessonContent['concept-002']).toBe(concept002)
    expect(isLessonAvailable('concept-002')).toBe(true)
  })

  it('uses unique step ids and labels, so the progress step number maps to one step', () => {
    expect(new Set(steps.map((step) => step.id)).size).toBe(steps.length)
    expect(new Set(steps.map((step) => step.stepLabel)).size).toBe(steps.length)
  })

  it('starts with a story and ends with the three-question knowledge check', () => {
    expect(steps[0].type).toBe('story')
    expect(steps[steps.length - 1].type).toBe('quiz')
  })

  it('has an activity that names its component and an introduction for students', () => {
    const activity = steps.find((step) => step.type === 'activity')

    expect(activity.activityId).toBe('build-the-loop')
    expect(activity.intro).toMatch(/copper wire/)
    expect(activity.intro).toMatch(/break the loop/)
  })

  it('has exactly three quiz questions, each with a valid answer and an explanation', () => {
    const quiz = steps.find((step) => step.type === 'quiz')

    expect(quiz.questions).toHaveLength(3)
    for (const question of quiz.questions) {
      expect(question.options.length).toBeGreaterThan(1)
      expect(question.answerIndex).toBeGreaterThanOrEqual(0)
      expect(question.answerIndex).toBeLessThan(question.options.length)
      expect(question.explanation).toEqual(expect.any(String))
    }
  })

  it('explains the power source, conductor, and electrical load, and why the loop must be complete', () => {
    const text = JSON.stringify(steps)

    expect(text).toMatch(/A power source, such as a battery/)
    expect(text).toMatch(/A conductor, such as copper wire/)
    expect(text).toMatch(/An electrical load, such as a light bulb/)
    expect(text).toMatch(/Current needs a complete path/)
  })

  it('states that the bulb uses energy, not charge', () => {
    expect(JSON.stringify(steps)).toMatch(/does not use up the charge/)
  })
})
