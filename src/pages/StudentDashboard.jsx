import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useLessonStatus } from '../hooks/useLessonStatus.js'
import { getProgress } from '../services/progressService.js'
import LESSONS from '../constants/lessons.js'
import { isLessonAvailable } from '../content/history/lessonAvailability.js'
import lessonContent from '../content/lessonContent.js'
import { chooseNextLessonId } from '../content/nextLesson.js'
import './StudentDashboard.css'

const NEXT_LESSON_ACTION_LABEL = {
  completed: 'Review Lesson',
  in_progress: 'Continue Lesson',
}

const PLAYABLE_LESSONS = LESSONS.filter((lesson) => isLessonAvailable(lesson.id))
const PLAYABLE_LESSON_IDS = new Set(PLAYABLE_LESSONS.map((lesson) => lesson.id))

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

function NextAdventureCard({ lessonId }) {
  const status = useLessonStatus(lessonId)
  const lesson = LESSONS.find((item) => item.id === lessonId)
  const activity = lessonContent[lessonId]?.steps.find((step) => step.type === 'activity')
  const actionLabel = NEXT_LESSON_ACTION_LABEL[status] ?? 'Start Lesson'

  return (
    <article className="dashboard-next-card" aria-labelledby="dashboard-next-lesson-title">
      <div className="dashboard-next-header">
        <h3 id="dashboard-next-lesson-title" className="dashboard-next-lesson-title">
          {lesson.title}
        </h3>
        {status === 'completed' && <span className="dashboard-badge">Completed</span>}
        {status === 'in_progress' && <span className="dashboard-pill">In progress</span>}
      </div>

      <p className="dashboard-next-description">
        {lesson.description}. Read the story
        {activity && `, try the ${activity.title} activity`}, and finish with the Knowledge Check quiz.
      </p>

      <div className="dashboard-next-footer">
        {status === 'checking' && (
          <p className="dashboard-status" role="status">
            Checking your progress...
          </p>
        )}
        {status !== 'checking' && (
          <Link className="btn btn-primary" to={`/journey/${lessonId}`}>
            {actionLabel}
          </Link>
        )}
        {status === 'error' && (
          <p className="dashboard-hint">
            We could not check your saved progress. Reload the page to see whether you have finished
            this lesson.
          </p>
        )}
      </div>
    </article>
  )
}

function NextAdventurePlaceholder() {
  return (
    <article className="dashboard-next-card">
      <div className="dashboard-next-footer">
        <p className="dashboard-status" role="status">
          Checking your progress...
        </p>
      </div>
    </article>
  )
}

function StudentDashboard() {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const overview = useProgressOverview(userId)
  const nextLessonId = chooseNextLessonId(overview.rows, PLAYABLE_LESSONS)
  const displayName = user?.user_metadata?.display_name?.trim() || 'explorer'

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
  // Same formula as getProgressSummary: completed lessons over every lesson in the curriculum
  const journeyCompletedCount = overview.rows.filter((row) => row.status === 'completed').length
  const journeyPercent = Math.round((journeyCompletedCount / LESSONS.length) * 100)

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

        {overview.status === 'loading' ? (
          <NextAdventurePlaceholder />
        ) : (
          nextLessonId && <NextAdventureCard lessonId={nextLessonId} />
        )}
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
              <div className="dashboard-stat">
                <dt>Journey progress</dt>
                <dd>{journeyPercent}%</dd>
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
