import { Link } from 'react-router-dom'
import { useLessonStatus } from '../hooks/useLessonStatus.js'
import { CheckIcon, LockIcon } from '../components/icons.jsx'
import './LearningJourney.css'

const LESSON_ID = 'history-001'
const LESSON_LINK = `/journey/${LESSON_ID}`

const LESSON_ACTION_LABEL = {
  completed: 'Review Lesson',
  in_progress: 'Continue Lesson',
}

const LESSON_STATUS_LABEL = {
  completed: 'Completed',
  in_progress: 'In progress',
  not_started: 'Not started',
}

const UPCOMING_CHAPTERS = [
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
  const statusLabel = LESSON_STATUS_LABEL[lessonStatus]
  const isChapterComplete = lessonStatus === 'completed'

  return (
    <div className="journey-page">
      <header className="journey-hero">
        <p className="journey-eyebrow">My Journey</p>
        <h1 className="journey-title">Your Electricity Adventure</h1>
        <p className="journey-welcome">
          Travel from the first electrical clues people noticed long ago to the electrical
          technology that powers homes today. Each chapter builds on the one before it, so follow
          the path one stop at a time.
        </p>
      </header>

      <ol className="journey-map" aria-label="Your learning path">
        <li className={`journey-stop ${isChapterComplete ? 'is-complete' : 'is-current'}`}>
          <div className="journey-node journey-node-active" aria-hidden="true">
            {isChapterComplete ? <CheckIcon className="journey-node-icon" /> : <span>1</span>}
          </div>

          <section
            className="journey-chapter-card journey-chapter-card-active"
            aria-labelledby="journey-chapter-1-title"
          >
            <div className="journey-chapter-header">
              <h2 id="journey-chapter-1-title" className="journey-chapter-title">
                Chapter 1: The First Sparks
              </h2>
              <span className="journey-chapter-tag">
                {isChapterComplete ? 'Chapter complete' : 'You are here'}
              </span>
            </div>
            <p className="journey-chapter-intro">
              Start here. This chapter takes you back to the first people who saw that rubbing
              certain things could make them pull on light objects.
            </p>

            <article className="journey-lesson-card" aria-labelledby="journey-lesson-title">
              <div className="journey-lesson-header">
                <h3 id="journey-lesson-title" className="journey-lesson-title">
                  Electricity Mysteries
                </h3>
                {statusLabel && (
                  <span
                    className={
                      lessonStatus === 'completed'
                        ? 'journey-badge'
                        : lessonStatus === 'in_progress'
                          ? 'journey-pill'
                          : 'journey-pill journey-pill-muted'
                    }
                  >
                    {statusLabel}
                  </span>
                )}
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
                {lessonStatus === 'signed-out' && (
                  <p className="journey-hint">Log in to save your progress as you go.</p>
                )}
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
        </li>

        {UPCOMING_CHAPTERS.map((chapter, index) => {
          const chapterNumber = index + 2
          const titleId = `journey-chapter-${chapterNumber}-title`

          return (
            <li key={chapter.title} className="journey-stop is-locked">
              <div className="journey-node journey-node-locked" aria-hidden="true">
                <LockIcon className="journey-node-icon" />
              </div>

              <section className="journey-chapter-card journey-chapter-locked" aria-labelledby={titleId}>
                <p className="journey-coming-soon">
                  <LockIcon className="journey-inline-icon" />
                  Coming Soon
                </p>
                <h2 id={titleId} className="journey-chapter-title">
                  Chapter {chapterNumber}: {chapter.title}
                </h2>
                <p className="journey-chapter-teaser">{chapter.teaser}</p>
              </section>
            </li>
          )
        })}
      </ol>

      <p className="journey-future-note">
        Chapters marked Coming Soon are previews. They are not playable yet.
      </p>
    </div>
  )
}

export default LearningJourney
