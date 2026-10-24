import { Link } from 'react-router-dom'
import { useLessonStatus } from '../hooks/useLessonStatus.js'
import './LearningJourney.css'

const LESSON_ID = 'history-001'
const LESSON_LINK = `/journey/${LESSON_ID}`

const LESSON_ACTION_LABEL = {
  completed: 'Review Lesson',
  in_progress: 'Continue Lesson',
}

const FUTURE_PREVIEWS = [
  {
    title: 'Charge and Current',
    teaser: 'Follow how charge moves through wires and other materials.',
  },
  {
    title: 'Circuits to Build',
    teaser: 'Connect parts in one path or in several paths and compare what happens.',
  },
  {
    title: 'Electricity at Home',
    teaser: 'Discover how the power in your home reaches the outlets you use.',
  },
]

function LearningJourney() {
  const lessonStatus = useLessonStatus(LESSON_ID)
  const actionLabel = LESSON_ACTION_LABEL[lessonStatus] ?? 'Start Lesson'

  return (
    <div className="journey-page">
      <header className="journey-hero">
        <p className="journey-eyebrow">Learning Journey</p>
        <h1 className="journey-title">The Electricity Journey</h1>
        <p className="journey-welcome">
          Welcome, explorer! Every big idea about electricity began with someone noticing a small,
          surprising clue. Your adventure starts with those first sparks.
        </p>
      </header>

      <section className="journey-chapter" aria-labelledby="journey-chapter-title">
        <h2 id="journey-chapter-title" className="journey-section-title">
          Chapter 1: The First Sparks
        </h2>
        <p className="journey-section-intro">
          Start here. This chapter takes you back to the first people who saw that rubbing certain
          things could make them pull on light objects.
        </p>

        <article className="journey-lesson-card" aria-labelledby="journey-lesson-title">
          <div className="journey-lesson-header">
            <h3 id="journey-lesson-title" className="journey-lesson-title">
              Electricity Mysteries
            </h3>
            {lessonStatus === 'completed' && <span className="journey-badge">Completed</span>}
            {lessonStatus === 'in_progress' && <span className="journey-pill">In progress</span>}
          </div>

          <p className="journey-lesson-description">
            Explore amber, static charge, and the mysterious pull that makes paper bits dance.
          </p>

          <ul className="journey-lesson-parts">
            <li>Story: the first clues</li>
            <li>Activity: Rub and Attract</li>
            <li>Quiz: Knowledge Check</li>
          </ul>

          <div className="journey-lesson-footer">
            {lessonStatus === 'checking' && (
              <p className="journey-status" role="status">
                Checking your progress...
              </p>
            )}
            {lessonStatus !== 'checking' && (
              <Link className="btn btn-primary" to={LESSON_LINK}>
                {actionLabel}
              </Link>
            )}
            {lessonStatus === 'error' && (
              <p className="journey-hint">
                We could not check your saved progress. Reload the page to see whether you have
                finished this lesson.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="journey-future" aria-labelledby="journey-future-title">
        <h2 id="journey-future-title" className="journey-section-title">
          Coming Up on Your Journey
        </h2>
        <p className="journey-section-intro">
          These previews show future discoveries. They are not playable yet.
        </p>

        <ul className="journey-preview-grid">
          {FUTURE_PREVIEWS.map((preview) => (
            <li key={preview.title}>
              <article className="journey-preview-card">
                <p className="journey-preview-label">Future content</p>
                <h3 className="journey-preview-title">{preview.title}</h3>
                <p className="journey-preview-teaser">{preview.teaser}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default LearningJourney
