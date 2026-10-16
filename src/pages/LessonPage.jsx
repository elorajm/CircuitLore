import { Link, useParams } from 'react-router-dom'
import LESSONS from '../constants/lessons.js'
import lessonContent from '../content/lessonContent.js'
import { useLessonProgress } from '../hooks/useLessonProgress.js'
import LessonSession from '../components/lesson/LessonSession.jsx'
import '../components/lesson/Lesson.css'

function LessonPage() {
  const { lessonId } = useParams()
  const lesson = LESSONS.find((item) => item.id === lessonId)
  const content = lesson ? lessonContent[lesson.id] : undefined

  if (!lesson) {
    return (
      <LessonFrame title="Lesson not found">
        <p>We could not find that lesson. Choose a lesson from the Learning Journey.</p>
        <Link className="btn btn-primary" to="/journey">
          Go to the Learning Journey
        </Link>
      </LessonFrame>
    )
  }

  if (!content) {
    return (
      <LessonFrame title={lesson.title}>
        <p>This lesson is coming soon.</p>
        <Link className="btn btn-secondary" to="/journey">
          Back to the Learning Journey
        </Link>
      </LessonFrame>
    )
  }

  return (
    <LessonFrame title={lesson.title}>
      <LoadedLesson lessonId={lesson.id} lessonTitle={lesson.title} steps={content.steps} />
    </LessonFrame>
  )
}

function LoadedLesson({ lessonId, lessonTitle, steps }) {
  const { loadStatus, record, saveState, persist, retrySave, reload } = useLessonProgress(lessonId)

  if (loadStatus === 'loading') {
    return <p className="loading-message">Loading your progress...</p>
  }

  if (loadStatus === 'error') {
    return (
      <div className="lesson-alert" role="alert">
        <p>
          We could not load your progress, so the lesson cannot start yet. Nothing has been changed.
        </p>
        <button type="button" className="btn btn-primary" onClick={reload}>
          Try again
        </button>
      </div>
    )
  }

  return (
    <LessonSession
      lessonTitle={lessonTitle}
      steps={steps}
      record={record}
      saveState={saveState}
      persist={persist}
      retrySave={retrySave}
    />
  )
}

function LessonFrame({ title, children }) {
  return (
    <div className="lesson-page">
      <header className="lesson-page-header">
        <p className="lesson-eyebrow">Learning Journey</p>
        <h1>{title}</h1>
      </header>
      {children}
    </div>
  )
}

export default LessonPage
