import LESSONS from '../../constants/lessons.js'
import lessonContent from '../lessonContent.js'

export function isLessonAvailable(lessonId, lessons = LESSONS, content = lessonContent) {
  return Boolean(lessonId) && lessons.some((lesson) => lesson.id === lessonId) && Boolean(content[lessonId])
}
