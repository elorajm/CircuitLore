import { Link } from 'react-router-dom'
import { useLessonStatus } from '../hooks/useLessonStatus.js'
import { CheckIcon, LockIcon } from '../components/icons.jsx'
import './LearningJourney.css'

const LESSON_ACTION_LABEL = {
  completed: 'Review Lesson',
  in_progress: 'Continue Lesson',
}

const LESSON_STATUS_LABEL = {
  completed: 'Completed',
  in_progress: 'In progress',
  not_started: 'Not started',
}

const CHAPTERS = [
  {
    number: 1,
    lessonId: 'history-001',
    title: 'The First Sparks',
    intro:
      'Start here. This chapter takes you back to the first people who saw that rubbing certain things could make them pull on light objects.',
    lessonTitle: 'Electricity Mysteries',
    description: 'Explore amber, static charge, and the mysterious pull that makes paper bits dance.',
    parts: ['Story: the first clues', 'Activity: Rub and Attract', 'Quiz: Knowledge Check'],
  },
  {
    number: 2,
    lessonId: 'concept-001',
    title: 'Charge and Current',
    intro:
      'Learn what electric charge is, then tell apart static electricity that stays put from current that keeps moving.',
    lessonTitle: 'Electric Charge',
    description:
      'Discover the tiny charged pieces inside everything, and why charge that stays still is different from charge that flows.',
    parts: ['Story: charge and its two kinds of motion', 'Activity: Static or Current?', 'Quiz: Knowledge Check'],
  },
  {
    number: 3,
    lessonId: 'concept-002',
    title: 'Circuits to Build',
    intro:
      'Build your first complete circuit, then break it to find out why current needs a loop.',
    lessonTitle: 'Electric Current',
    description:
      'Learn what current is, and what a power source, a conductor, and a load do in a circuit.',
    parts: ['Story: current and the complete path', 'Activity: Build the Loop', 'Quiz: Knowledge Check'],
  },
  {
    number: 4,
    lessonId: 'modern-001',
    title: 'Electricity at Home',
    intro: 'Discover how electricity reaches your home, how devices use power, and how to stay safe around it.',
    lessonTitle: 'Home Electricity',
    description: 'How electricity powers homes, from the power plant to the outlet.',
    parts: ['Story: from power plant to outlet', 'Activity: Power the House', 'Quiz: Knowledge Check'],
  },
]

// Future chapters that are shown as locked previews. Empty now that every planned chapter is playable.
// Add entries here to show a Coming Soon preview before a lesson is built.
const UPCOMING_CHAPTERS = []

function JourneyChapter({ chapter }) {
  const lessonStatus = useLessonStatus(chapter.lessonId)
  const actionLabel = LESSON_ACTION_LABEL[lessonStatus] ?? 'Start Lesson'
  const statusLabel = LESSON_STATUS_LABEL[lessonStatus]
  const isChapterComplete = lessonStatus === 'completed'
  const lessonLink = `/journey/${chapter.lessonId}`

  let chapterTag = 'Up next'
  if (isChapterComplete) {
    chapterTag = 'Chapter complete'
  } else if (chapter.number === 1) {
    chapterTag = 'You are here'
  }

  return (
    <li className={`journey-stop ${isChapterComplete ? 'is-complete' : 'is-current'}`}>
      <div className="journey-node journey-node-active" aria-hidden="true">
        {isChapterComplete ? <CheckIcon className="journey-node-icon" /> : <span>{chapter.number}</span>}
      </div>

      <section
        className="journey-chapter-card journey-chapter-card-active"
        aria-labelledby={`journey-chapter-${chapter.number}-title`}
      >
        <div className="journey-chapter-header">
          <h2 id={`journey-chapter-${chapter.number}-title`} className="journey-chapter-title">
            Chapter {chapter.number}: {chapter.title}
          </h2>
          <span className="journey-chapter-tag">{chapterTag}</span>
        </div>
        <p className="journey-chapter-intro">{chapter.intro}</p>

        <article
          className="journey-lesson-card"
          aria-labelledby={`journey-lesson-${chapter.number}-title`}
        >
          <div className="journey-lesson-header">
            <h3 id={`journey-lesson-${chapter.number}-title`} className="journey-lesson-title">
              {chapter.lessonTitle}
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

          <p className="journey-lesson-description">{chapter.description}</p>

          <ul className="journey-lesson-parts">
            {chapter.parts.map((part) => (
              <li key={part}>{part}</li>
            ))}
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
              <Link className="btn btn-primary" to={lessonLink}>
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
  )
}

function LearningJourney() {
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
        {CHAPTERS.map((chapter) => (
          <JourneyChapter key={chapter.lessonId} chapter={chapter} />
        ))}

        {UPCOMING_CHAPTERS.map((chapter, index) => {
          const chapterNumber = CHAPTERS.length + index + 1
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

      <aside className="journey-lab" aria-labelledby="journey-lab-title">
        <h2 id="journey-lab-title" className="journey-lab-title">
          Want to experiment?
        </h2>
        <p className="journey-lab-text">
          Build circuits with a battery, a switch, and bulbs in the Virtual Circuit Lab.
        </p>
        <Link className="btn btn-primary" to="/circuit-lab">
          Open the Circuit Lab
        </Link>
      </aside>

      {UPCOMING_CHAPTERS.length > 0 && (
        <p className="journey-future-note">
          Chapters marked Coming Soon are previews. They are not playable yet.
        </p>
      )}
    </div>
  )
}

export default LearningJourney
