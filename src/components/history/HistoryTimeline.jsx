import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLessonStatus } from '../../hooks/useLessonStatus.js'
import { isLessonAvailable } from '../../content/history/lessonAvailability.js'
import './HistoryTimeline.css'

const LESSON_ACTIONS = {
  'signed-out': {
    label: 'Start lesson',
    hint: 'Log in to start this lesson and save your progress.',
  },
  error: {
    label: 'Start lesson',
    hint: 'We could not check your saved progress. Reload the page to see whether you have finished this lesson.',
  },
  not_started: {
    label: 'Start lesson',
    hint: 'Your progress is saved automatically.',
  },
  in_progress: {
    label: 'Continue lesson',
    hint: 'Your progress is saved automatically.',
  },
  completed: {
    label: 'Review lesson',
    hint: 'Lesson completed!',
  },
}

function LessonComingSoon() {
  return (
    <div className="timeline-lesson-link">
      <button
        type="button"
        className="timeline-lesson-soon"
        disabled
        aria-describedby="timeline-lesson-hint"
      >
        Lesson coming soon
      </button>
      <p id="timeline-lesson-hint" className="timeline-lesson-hint">
        This lesson has not been written yet. It will open from here once it is ready.
      </p>
    </div>
  )
}

function LessonAction({ lessonId }) {
  const status = useLessonStatus(lessonId)

  if (status === 'checking') {
    return (
      <div className="timeline-lesson-link">
        <p className="timeline-lesson-hint" role="status">
          Checking your progress...
        </p>
      </div>
    )
  }

  const action = LESSON_ACTIONS[status]
  return (
    <div className="timeline-lesson-link">
      <Link
        className="btn btn-primary"
        to={`/journey/${lessonId}`}
        aria-describedby="timeline-lesson-hint"
      >
        {action.label}
      </Link>
      <p id="timeline-lesson-hint" className="timeline-lesson-hint">
        {action.hint}
      </p>
    </div>
  )
}

function BookIcon() {
  return (
    <svg
      className="timeline-notes-icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z" />
      <path d="M22 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z" />
    </svg>
  )
}

function gapLabel(milestones, index) {
  if (index === 0) return null
  const gap = milestones[index].year - milestones[index - 1].year
  if (gap < 50) return null
  const rounded = gap < 200 ? Math.round(gap / 10) * 10 : Math.round(gap / 50) * 50
  return `About ${rounded.toLocaleString('en-US')} years after the previous milestone`
}

function HistoryTimeline({ milestones }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [notesOpen, setNotesOpen] = useState(false)
  const itemRefs = useRef([])
  const hasSelectionChanged = useRef(false)

  const selected = milestones[selectedIndex]
  const isFirst = selectedIndex === 0
  const isLast = selectedIndex === milestones.length - 1
  const gap = gapLabel(milestones, selectedIndex)

  useEffect(() => {
    if (!hasSelectionChanged.current) return
    itemRefs.current[selectedIndex]?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }, [selectedIndex])

  function selectMilestone(index) {
    if (index === selectedIndex) return
    hasSelectionChanged.current = true
    setNotesOpen(false)
    setSelectedIndex(index)
  }

  function goPrevious() {
    if (!isFirst) selectMilestone(selectedIndex - 1)
  }

  function goNext() {
    if (!isLast) selectMilestone(selectedIndex + 1)
  }

  return (
    <section className="history-timeline" aria-labelledby="history-timeline-heading">
      <h2 id="history-timeline-heading" className="history-timeline-heading">
        Follow the discoveries
      </h2>

      <ol className="timeline-rail">
        {milestones.map((milestone, index) => {
          const isSelected = index === selectedIndex
          return (
            <li key={milestone.id} className="timeline-rail-item">
              <button
                type="button"
                ref={(element) => {
                  itemRefs.current[index] = element
                }}
                className="timeline-marker-button"
                aria-pressed={isSelected}
                aria-controls="timeline-detail"
                onClick={() => selectMilestone(index)}
              >
                <span className="timeline-dot" aria-hidden="true" />
                <span className="timeline-year">{milestone.displayDate}</span>
                <span className="timeline-name">{milestone.shortName}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <section id="timeline-detail" className="timeline-detail" aria-labelledby="timeline-detail-title">
        <p className="timeline-detail-meta">
          {selected.displayDate} &middot; {selected.person}
        </p>
        {gap && <p className="timeline-gap">{gap}</p>}
        <h3 id="timeline-detail-title">{selected.shortName}</h3>
        <p className="timeline-detail-summary">{selected.summary}</p>

        {selected.story.map((paragraph, index) => (
          <p key={index} className="timeline-detail-text">
            {paragraph}
          </p>
        ))}

        <p className="timeline-hook">{selected.nextHook}</p>

        <div className="timeline-callout timeline-callout-today">
          <h4>Today</h4>
          <p>{selected.modernLink}</p>
        </div>

        {isLessonAvailable(selected.lessonId) ? (
          <LessonAction lessonId={selected.lessonId} />
        ) : (
          <LessonComingSoon />
        )}

        <div className="timeline-notes">
          <button
            type="button"
            className="timeline-notes-toggle"
            aria-expanded={notesOpen}
            aria-controls="timeline-notes-panel"
            onClick={() => setNotesOpen((open) => !open)}
          >
            <BookIcon />
            Historian&rsquo;s notes
          </button>

          <div id="timeline-notes-panel" className="timeline-notes-panel" hidden={!notesOpen}>
            {selected.historianNote && (
              <>
                <h4>Caveats</h4>
                <p className="timeline-caveat">{selected.historianNote}</p>
              </>
            )}

            <h4>Sources</h4>
            <ul>
              {selected.sources.map((source, index) => (
                <li key={index}>
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.label}
                      <span className="timeline-sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    source.label
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <nav className="timeline-controls" aria-label="Timeline milestones">
        <button
          type="button"
          className="timeline-nav-button"
          aria-disabled={isFirst}
          onClick={goPrevious}
        >
          Previous
        </button>
        <span className="timeline-position">
          Milestone {selectedIndex + 1} of {milestones.length}
        </span>
        <button
          type="button"
          className="timeline-nav-button"
          aria-disabled={isLast}
          onClick={goNext}
        >
          Next
        </button>
      </nav>
    </section>
  )
}

export default HistoryTimeline
