import LESSONS from '../constants/lessons.js'
import { isLessonAvailable } from './history/lessonAvailability.js'

const PLAYABLE_LESSONS = LESSONS.filter((lesson) => isLessonAvailable(lesson.id))

// Picks the lesson for "Your Next Adventure". Only playable lessons are considered, in curriculum order:
// 1. Keep going: the in-progress lesson the student saved most recently
// 2. Otherwise: the first playable lesson that is not completed yet
// 3. Otherwise: the first playable lesson, for review
export function chooseNextLessonId(rows, playableLessons) {
  const ordered = [...playableLessons].sort((a, b) => a.order - b.order)
  const rowById = new Map(rows.map((row) => [row.lesson_id, row]))
  const statusOf = (lesson) => rowById.get(lesson.id)?.status

  const inProgress = ordered
    .filter((lesson) => statusOf(lesson) === 'in_progress')
    .sort((a, b) =>
      (rowById.get(b.id).last_accessed_at ?? '').localeCompare(rowById.get(a.id).last_accessed_at ?? ''),
    )
  if (inProgress.length > 0) return inProgress[0].id

  const unfinished = ordered.find((lesson) => statusOf(lesson) !== 'completed')
  return (unfinished ?? ordered[0])?.id ?? null
}

// The playable lesson that comes after this one in curriculum order, or null when there is none.
// Used at the end of a lesson to lead the student into the next one.
export function nextPlayableLesson(lessonId, playableLessons = PLAYABLE_LESSONS) {
  const ordered = [...playableLessons].sort((a, b) => a.order - b.order)
  const index = ordered.findIndex((lesson) => lesson.id === lessonId)
  return index === -1 ? null : (ordered[index + 1] ?? null)
}
