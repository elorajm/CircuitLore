import LESSONS from '../../constants/lessons.js'
import timelineMilestones from './timeline.js'
import { isLessonAvailable } from './lessonAvailability.js'

// Milestones are the single source of truth for historical links. A milestone connects to a lesson
// either as its own lesson (lessonId) or as a related lesson with a note (relatedLessons).

// Playable lessons related to one milestone. Lessons without content are never returned.
export function playableLessonsForMilestone(milestone) {
  return (milestone.relatedLessons ?? [])
    .filter((related) => isLessonAvailable(related.lessonId))
    .map((related) => ({
      lessonId: related.lessonId,
      title: LESSONS.find((lesson) => lesson.id === related.lessonId).title,
      note: related.note,
    }))
}

// Milestones connected to one lesson, with the note shown on the timeline for that connection
export function historyConnectionsForLesson(lessonId, milestones = timelineMilestones) {
  const connections = []

  for (const milestone of milestones) {
    if (milestone.lessonId === lessonId) {
      connections.push({ milestone, note: null })
    }
    for (const related of milestone.relatedLessons ?? []) {
      if (related.lessonId === lessonId) {
        connections.push({ milestone, note: related.note })
      }
    }
  }

  return connections
}
