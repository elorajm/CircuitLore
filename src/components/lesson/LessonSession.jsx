import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ScrollIcon } from '../icons.jsx'
import StoryBlock from './StoryBlock.jsx'
import RubAttractActivity from './RubAttractActivity.jsx'
import KnowledgeCheck from './KnowledgeCheck.jsx'
import LessonComplete from './LessonComplete.jsx'
import './Lesson.css'

function readMetadata(record) {
  const metadata = record?.metadata ?? {}
  return {
    step: Number.isInteger(metadata.step) ? metadata.step : 0,
    quizScore: Number.isInteger(metadata.quizScore) ? metadata.quizScore : null,
    activityDone: metadata.activityDone === true,
  }
}

function buildMetadata(step, quizScore, activityDone) {
  return { step, quizScore, activityDone }
}

function LessonSession({ lessonTitle, steps, record, saveState, persist, retrySave }) {
  const lastIndex = steps.length - 1
  const isReview = record?.status === 'completed'
  const started = record?.status === 'in_progress' || isReview
  const saved = readMetadata(record)

  const [stepIndex, setStepIndex] = useState(() => {
    if (isReview || !started) return 0
    return Math.min(Math.max(saved.step, 0), lastIndex)
  })
  const [activityDone, setActivityDone] = useState(saved.activityDone)
  const [quizScore, setQuizScore] = useState(saved.quizScore)

  const step = steps[stepIndex]
  const isSaving = saveState === 'saving'
  const isLast = stepIndex === lastIndex
  const showCompletion = isReview && isLast
  const quizQuestionCount = steps.find((item) => item.type === 'quiz')?.questions.length ?? 0
  const activityBlocksNext = step.type === 'activity' && !activityDone && !isReview

  function goNext() {
    const next = Math.min(stepIndex + 1, lastIndex)
    if (isReview) {
      setStepIndex(next)
      return
    }
    persist('in_progress', buildMetadata(next, quizScore, activityDone), () => setStepIndex(next))
  }

  function submitQuiz(score) {
    if (isReview) return
    persist('in_progress', buildMetadata(stepIndex, score, activityDone), () => setQuizScore(score))
  }

  function finishLesson() {
    persist('completed', buildMetadata(lastIndex, quizScore, activityDone), () =>
      setStepIndex(lastIndex),
    )
  }

  const nextLabel = !started && stepIndex === 0 ? 'Begin' : 'Next'

  return (
    <article className="lesson-session" aria-labelledby="lesson-step-title">
      {!showCompletion && (
        <p className="lesson-step-label">
          Step {stepIndex + 1} of {steps.length}: {step.stepLabel}
        </p>
      )}
      <progress
        className="lesson-progress"
        value={stepIndex + 1}
        max={steps.length}
        aria-label={`${lessonTitle} progress`}
      />

      {isReview && !showCompletion && (
        <p className="lesson-banner" role="status">
          Review mode. You have finished this lesson. Looking back does not change your saved progress.
        </p>
      )}

      {showCompletion ? (
        <LessonComplete
          lessonTitle={lessonTitle}
          quizScore={quizScore}
          totalQuestions={quizQuestionCount}
        />
      ) : (
        <>
          {stepIndex === 0 && (
            <div className="lesson-intro-badge" aria-hidden="true">
              <ScrollIcon width="48" height="48" />
            </div>
          )}

          <h2 id="lesson-step-title" className="lesson-step-title">
            {step.title}
          </h2>

          {step.type === 'story' && (
            <div className="lesson-blocks">
              {step.blocks.map((block, index) => (
                <StoryBlock key={index} block={block} index={index} />
              ))}
            </div>
          )}

          {step.type === 'activity' && (
            <>
              <p className="lesson-intro">{step.intro}</p>
              <RubAttractActivity onCompleted={() => setActivityDone(true)} />
            </>
          )}

          {step.type === 'quiz' && (
            <>
              <p className="lesson-intro">{step.intro}</p>
              <KnowledgeCheck questions={step.questions} onChecked={submitQuiz} />
            </>
          )}
        </>
      )}

      {isSaving && (
        <p className="lesson-saving" role="status">
          Saving your progress...
        </p>
      )}

      {saveState === 'failed' && (
        <div className="lesson-alert" role="alert">
          <p>
            Your progress could not be saved, so you are still on this step. Your quiz answers are
            kept. Try again when you are ready.
          </p>
          <button type="button" className="btn btn-primary" onClick={retrySave}>
            Try saving again
          </button>
        </div>
      )}

      <nav className="lesson-nav" aria-label="Lesson navigation">
        {stepIndex > 0 && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setStepIndex(stepIndex - 1)}
            disabled={isSaving || saveState === 'failed'}
          >
            Back
          </button>
        )}

        {!isLast && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={goNext}
            disabled={isSaving || activityBlocksNext}
          >
            {nextLabel}
          </button>
        )}

        {isLast && !isReview && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={finishLesson}
            disabled={isSaving || quizScore === null}
          >
            Finish Lesson
          </button>
        )}

        {!showCompletion && (
          <Link className="btn btn-secondary" to="/journey">
            Back to the Learning Journey
          </Link>
        )}
      </nav>

      {activityBlocksNext && (
        <p className="lesson-hint">Finish the Rub and Attract activity to continue.</p>
      )}
      {isLast && !isReview && quizScore === null && (
        <p className="lesson-hint">Check your answers to unlock Finish Lesson.</p>
      )}
    </article>
  )
}

export default LessonSession
