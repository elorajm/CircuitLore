import { describe, it, expect } from 'vitest'
import modern001 from './modern001.js'
import LESSONS from '../../constants/lessons.js'
import lessonContent from '../lessonContent.js'
import { isLessonAvailable } from '../history/lessonAvailability.js'

const steps = modern001.steps
const allText = JSON.stringify(steps)

describe('modern-001 lesson content', () => {
  it('is the Home Electricity lesson in the curriculum, and is registered for playback', () => {
    expect(LESSONS.find((lesson) => lesson.id === 'modern-001')?.title).toBe('Home Electricity')
    expect(lessonContent['modern-001']).toBe(modern001)
    expect(isLessonAvailable('modern-001')).toBe(true)
  })

  it('uses unique step ids and labels, so the progress step number maps to one step', () => {
    expect(new Set(steps.map((step) => step.id)).size).toBe(steps.length)
    expect(new Set(steps.map((step) => step.stepLabel)).size).toBe(steps.length)
  })

  it('starts with a story and ends with the knowledge check', () => {
    expect(steps[0].type).toBe('story')
    expect(steps[steps.length - 1].type).toBe('quiz')
  })

  it('has one activity that names its component', () => {
    const activities = steps.filter((step) => step.type === 'activity')

    expect(activities).toHaveLength(1)
    expect(activities[0].activityId).toBe('power-the-house')
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

  it('explains power in watts and energy in watt-hours as different measurements', () => {
    expect(allText).toMatch(/Power is how fast a device uses electricity\. It is measured in watts \(W\)/)
    expect(allText).toMatch(/Energy is the total electricity used over time\. It is measured in watt-hours \(Wh\)/)
    expect(allText).toMatch(/300 watt-hours of energy/)
  })

  it('labels the 1,800 W limit as fictional and the appliance wattages as illustrative', () => {
    const activity = steps.find((step) => step.type === 'activity')

    expect(activity.intro).toMatch(/the 1,800 W limit is made up for this activity/)
    expect(activity.intro).toMatch(/wattages are illustrative/)
  })

  it('tells students the four activity goals in order in Quill’s challenge text', () => {
    const activity = steps.find((step) => step.type === 'activity')
    const order = [
      /First, turn on appliances and watch the total wattage/,
      /Second, go over the 1,800 W challenge limit to trip the breaker/,
      /Third, reset the breaker/,
      /Last, turn on at least two appliances and stay under the limit/,
    ]

    let position = 0
    for (const goal of order) {
      const found = activity.intro.slice(position).search(goal)
      expect(found).toBeGreaterThanOrEqual(0)
      position += found
    }
  })

  it('gives the outlet voltages as examples that differ by country, not as one universal value', () => {
    expect(allText).toMatch(/In many homes in the United States, outlets supply about 120 volts/)
    expect(allText).toMatch(/Many other countries use about 230 volts/)
  })

  it('explains the physics of long-distance transmission without a universal claim', () => {
    expect(allText).toMatch(/For the same amount of power, a higher voltage needs a smaller current/)
    expect(allText).toMatch(/wastes less energy as heat in the wires/)
  })

  it('connects the lesson to Faraday, Tesla, and Edison by name', () => {
    expect(allText).toMatch(/Michael Faraday/)
    expect(allText).toMatch(/Nikola Tesla/)
    expect(allText).toMatch(/Thomas Edison/)
  })

  it('never invites students to experiment with outlets or household wiring', () => {
    expect(allText).toMatch(/Never experiment with wall outlets or household wiring/)
    expect(allText).not.toMatch(/try (plugging|putting|sticking|connecting)/i)
  })

  it('points to the Circuit Lab, and says the lab uses a battery rather than a wall outlet', () => {
    expect(modern001.circuitLab.note).toMatch(/The lab uses a battery, not a wall outlet/)
    expect(modern001.circuitLab.note).toMatch(/never try this with wall outlets/)
  })
})
