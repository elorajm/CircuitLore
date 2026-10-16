import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PlaceholderPage from '../components/PlaceholderPage.jsx'
import { MapIcon } from '../components/icons.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { getLessonProgress } from '../services/progressService.js'
import './LearningJourney.css'

const LESSON_ID = 'history-001'
const LESSON_TITLE = 'Electricity Mysteries'

function useLessonStatus() {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? null
  const [result, setResult] = useState({ userId: null, status: 'ready', record: null })

  useEffect(() => {
    if (!userId) return undefined
    let cancelled = false

    getLessonProgress(LESSON_ID).then(
      (record) => {
        if (!cancelled) setResult({ userId, status: 'ready', record })
      },
      () => {
        if (!cancelled) setResult({ userId, status: 'error', record: null })
      },
    )

    return () => {
      cancelled = true
    }
  }, [userId])

  if (authLoading) return 'checking'
  if (!userId) return 'signed-out'
  if (result.userId !== userId) return 'checking'
  if (result.status === 'error') return 'error'
  return result.record?.status ?? 'not_started'
}

function LearningJourney() {
  const lessonStatus = useLessonStatus()

  let action
  if (lessonStatus === 'completed') {
    action = { to: `/journey/${LESSON_ID}`, label: `Review ${LESSON_TITLE}` }
  } else if (lessonStatus === 'in_progress') {
    action = { to: `/journey/${LESSON_ID}`, label: `Continue ${LESSON_TITLE}` }
  } else {
    action = { to: `/journey/${LESSON_ID}`, label: `Start ${LESSON_TITLE}` }
  }

  return (
    <>
      <PlaceholderPage
        icon={MapIcon}
        eyebrow="Learning Journey"
        title="The Electricity Journey"
        description="The full learning path will guide you from historical discoveries into modern electrical concepts, unlocking new sections as you go."
        plannedFeatures={[
          'Journey map with current location',
          'Lesson order and unlocking',
          'Historical-to-modern timeline',
          'Navigation between learning sections',
        ]}
      />
      <div className="journey-start">
        {lessonStatus === 'checking' && (
          <p className="journey-status" role="status">
            Checking your progress...
          </p>
        )}
        {lessonStatus === 'completed' && <span className="journey-badge">Completed</span>}
        {lessonStatus !== 'checking' && (
          <Link className="btn btn-primary" to={action.to}>
            {action.label}
          </Link>
        )}
        {lessonStatus === 'error' && (
          <p className="journey-hint">
            We could not check your saved progress. Reload the page to see whether you have finished
            this lesson.
          </p>
        )}
      </div>
    </>
  )
}

export default LearningJourney
