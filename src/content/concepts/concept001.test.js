import { describe, it, expect } from 'vitest'
import concept001 from './concept001.js'
import LESSONS from '../../constants/lessons.js'
import lessonContent from '../lessonContent.js'
import { isLessonAvailable } from '../history/lessonAvailability.js'

const steps = concept001.steps

describe('concept-001 lesson content', () => {
  it('is registered in the curriculum and in the lesson content map', () => {
    expect(LESSONS.some((lesson) => lesson.id === 'concept-001')).toBe(true)
    expect(lessonContent['concept-001']).toBe(concept001)
    expect(isLessonAvailable('concept-001')).toBe(true)
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

    expect(activity.activityId).toBe('static-or-current')
    expect(activity.intro).toMatch(/static electricity/)
    expect(activity.intro).toMatch(/electric current/)
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

  it('explains the difference between static electricity and current in its story steps', () => {
    const text = JSON.stringify(steps)

    expect(text).toMatch(/Static electricity is charge that builds up/)
    expect(text).toMatch(/Electric current is charge that keeps moving/)
  })
})
