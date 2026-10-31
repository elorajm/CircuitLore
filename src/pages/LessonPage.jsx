import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import LESSONS from '../constants/lessons.js'
import lessonContent from '../content/lessonContent.js'
import { useLessonProgress } from '../hooks/useLessonProgress.js'
import {
  getLessonProgress,
  resetProgress,
} from '../services/progressService.js'
import LessonSession from '../components/lesson/LessonSession.jsx'
import '../components/lesson/Lesson.css'

function LessonPage() {
  const { lessonId } = useParams()
  const lesson = LESSONS.find((item) => item.id === lessonId)
  const content = lesson ? lessonContent[lesson.id] : undefined

  if (!lesson) {
    return (
      <LessonFrame title="Lesson not found">
        <p>
          We could not find that lesson. Choose a lesson from the Learning Journey.
        </p>
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
      <LoadedLesson
        key={lesson.id}
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        steps={content.steps}
      />
    </LessonFrame>
  )
}

function LoadedLesson({ lessonId, lessonTitle, steps }) {
  const {
    loadStatus,
    record,
    saveState,
    persist,
    retrySave,
    reload,
  } = useLessonProgress(lessonId)

  const [resetting, setResetting] = useState(false)
  const [resetError, setResetError] = useState('')
  const [sessionVersion, setSessionVersion] = useState(0)

  async function handleReset() {
    if (resetting || saveState !== 'idle') {
      return
    }

    const confirmed = window.confirm(
      'Are you sure you want to reset this lesson? Your saved answers and completion status will be cleared. You can complete the lesson again.'
    )

    if (!confirmed) {
      return
    }

    setResetting(true)
    setResetError('')

    try {
      // Reset only the current student's selected lesson.
      await resetProgress(lessonId)

      // Verify the database now reports Not Started.
      const updatedRecord = await getLessonProgress(lessonId)

      if (!updatedRecord || updatedRecord.status !== 'not_started') {
        throw new Error('The lesson reset could not be verified.')
      }

      // Reload progress from Supabase.
      // While loading, LessonSession is unmounted so its local state
      // will be initialized from the newly loaded record.
      setSessionVersion((version) => version + 1)
      reload()
    } catch {
      setResetError(
        'We could not reset your lesson progress. Please try again.'
      )
    } finally {
      setResetting(false)
    }
  }

  if (loadStatus === 'loading') {
    return (
      <p className="loading-message">
        Loading your progress...
      </p>
    )
  }

  if (loadStatus === 'error') {
    return (
      <div className="lesson-alert" role="alert">
        <p>
          We could not load your progress, so the lesson cannot start yet.
          Nothing has been changed.
        </p>

        <button
          type="button"
          className="btn btn-primary"
          onClick={reload}
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <>
      <LessonSession
        key={`${lessonId}-${sessionVersion}`}
        lessonTitle={lessonTitle}
        steps={steps}
        record={record}
        saveState={saveState}
        persist={persist}
        retrySave={retrySave}
      />

      {record && record.status !== 'not_started' && (
        <div className="lesson-reset">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={resetting || saveState !== 'idle'}
          >
            {resetting
              ? 'Resetting...'
              : 'Reset Lesson Progress'}
          </button>
        </div>
      )}

      {resetError && (
        <div className="lesson-alert" role="alert">
          <p>{resetError}</p>
        </div>
      )}
    </>
  )
}

function LessonFrame({ title, children }) {
  return (
    <div className="lesson-page">
      <header className="lesson-page-header">
        <p className="lesson-eyebrow">
          Learning Journey
        </p>
        <h1>{title}</h1>
      </header>

      {children}
    </div>
  )
}

export default LessonPage