import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useLessonStatus } from '../hooks/useLessonStatus.js'
import { getProgress } from '../services/progressService.js'
import LESSONS from '../constants/lessons.js'
import { isLessonAvailable } from '../content/history/lessonAvailability.js'
import './StudentDashboard.css'

const NEXT_LESSON_ID = 'history-001'
const NEXT_LESSON_LINK = `/journey/${NEXT_LESSON_ID}`

const NEXT_LESSON_ACTION_LABEL = {
  completed: 'Review Lesson',
  in_progress: 'Continue Lesson',
}

const PLAYABLE_LESSON_IDS = new Set(
  LESSONS.filter((lesson) => isLessonAvailable(lesson.id)).map((lesson) => lesson.id),
)

const EXPLORE_LINKS = [
  {
    to: '/journey',
    label: 'My Journey',
    description: 'Follow the story from the first sparks of electricity.',
  },
  {
    to: '/history',
    label: 'History',
    description: 'Meet the discoverers and the milestones that shaped electricity.',
  },
  {
    to: '/lessons',
    label: 'Lessons',
    description: 'Browse all lesson topics.',
    comingSoon: true,
  },
  {
    to: '/circuit-lab',
    label: 'Circuit Lab',
    description: 'Build and test circuits in the lab.',
    comingSoon: true,
  },
]

function useProgressOverview(userId) {
  const [result, setResult] = useState({ key: null, status: 'ready', rows: [] })
  const requestKey = userId ?? null

  useEffect(() => {
    if (!requestKey) return undefined
    let cancelled = false

    getProgress().then(
      (rows) => {
        if (!cancelled) setResult({ key: requestKey, status: 'ready', rows })
      },
      () => {
        if (!cancelled) setResult({ key: requestKey, status: 'error', rows: [] })
      },
    )

    return () => {
      cancelled = true
    }
  }, [requestKey])

  if (result.key !== requestKey) return { status: 'loading', rows: [] }
  return result
}

function StudentDashboard() {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const nextLessonStatus = useLessonStatus(NEXT_LESSON_ID)
  const overview = useProgressOverview(userId)
  const nextLesson = LESSONS.find((lesson) => lesson.id === NEXT_LESSON_ID)
  const displayName = user?.user_metadata?.display_name?.trim() || 'explorer'
  const actionLabel = NEXT_LESSON_ACTION_LABEL[nextLessonStatus] ?? 'Start Lesson'

  if (!user) {
    return (
      <div className="dashboard-page">
        <p className="dashboard-status">Log in to see your dashboard.</p>
        <Link className="btn btn-primary" to="/login">
          Log In
        </Link>
      </div>
    )
  }

  const playableCount = PLAYABLE_LESSON_IDS.size
  const completedCount = overview.rows.filter(
    (row) => row.status === 'completed' && PLAYABLE_LESSON_IDS.has(row.lesson_id),
  ).length

  return (
    <div className="dashboard-page">
      <header className="dashboard-hero">
        <p className="dashboard-eyebrow">Student Dashboard</p>
        <h1 className="dashboard-title">Welcome back, {displayName}!</h1>
        <p className="dashboard-intro">Pick up where you left off, or explore what is ready to play.</p>
      </header>

      <section className="dashboard-section" aria-labelledby="dashboard-next-title">
        <h2 id="dashboard-next-title" className="dashboard-section-title">
          Your Next Adventure
        </h2>

        <article className="dashboard-next-card" aria-labelledby="dashboard-next-lesson-title">
          <div className="dashboard-next-header">
            <h3 id="dashboard-next-lesson-title" className="dashboard-next-lesson-title">
              {nextLesson.title}
            </h3>
            {nextLessonStatus === 'completed' && (
              <span className="dashboard-badge">Completed</span>
            )}
            {nextLessonStatus === 'in_progress' && (
              <span className="dashboard-pill">In progress</span>
            )}
          </div>

          <p className="dashboard-next-description">
            {nextLesson.description}. Read the story, try the Rub and Attract activity, and finish
            with the Knowledge Check quiz.
          </p>

          <div className="dashboard-next-footer">
            {nextLessonStatus === 'checking' && (
              <p className="dashboard-status" role="status">
                Checking your progress...
              </p>
            )}
            {nextLessonStatus !== 'checking' && (
              <Link className="btn btn-primary" to={NEXT_LESSON_LINK}>
                {actionLabel}
              </Link>
            )}
            {nextLessonStatus === 'error' && (
              <p className="dashboard-hint">
                We could not check your saved progress. Reload the page to see whether you have
                finished this lesson.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="dashboard-section" aria-labelledby="dashboard-progress-title">
        <h2 id="dashboard-progress-title" className="dashboard-section-title">
          Your Progress
        </h2>

        {overview.status === 'loading' && (
          <p className="dashboard-status" role="status">
            Loading your progress...
          </p>
        )}

        {overview.status === 'error' && (
          <p className="dashboard-hint">
            We could not load your progress. Reload the page to try again.
          </p>
        )}

        {overview.status === 'ready' && (
          <>
            <dl className="dashboard-stats">
              <div className="dashboard-stat">
                <dt>Playable lessons</dt>
                <dd>{playableCount}</dd>
              </div>
              <div className="dashboard-stat">
                <dt>Lessons completed</dt>
                <dd>{completedCount}</dd>
              </div>
            </dl>

            {playableCount === 1 && (
              <p className="dashboard-note">
                Only one lesson is playable right now. More adventures are on the way.
              </p>
            )}

            {overview.rows.length === 0 && (
              <p className="dashboard-note">
                You have not started any lessons yet. Your progress will appear here once you begin.
              </p>
            )}
          </>
        )}
      </section>

      <section className="dashboard-section" aria-labelledby="dashboard-explore-title">
        <h2 id="dashboard-explore-title" className="dashboard-section-title">
          Explore CircuitLore
        </h2>

        <ul className="dashboard-explore-grid">
          {EXPLORE_LINKS.map((item) => (
            <li key={item.to}>
              <Link className="dashboard-explore-card" to={item.to}>
                <span className="dashboard-explore-title">{item.label}</span>
                <span className="dashboard-explore-text">{item.description}</span>
                {item.comingSoon && <span className="dashboard-soon">Coming soon</span>}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default StudentDashboard
