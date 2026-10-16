import { useState } from 'react'
import LESSONS from '../constants/lessons.js'
import { useAuth } from '../hooks/useAuth.js'
import {
  getLessonProgress,
  resetProgress,
  saveProgress,
} from '../services/progressService.js'
import '../pages/AuthForm.css'
import './ProgressTestPage.css'

const DEFAULT_LESSON_ID = 'history-001'
const DEFAULT_METADATA = '{"source": "dev-test"}'

function parseMetadataText(text) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Metadata must be valid JSON.')
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Metadata must be a JSON object, such as {"source": "dev-test"}.')
  }

  return parsed
}

function ProgressTestPage() {
  const { user } = useAuth()
  const [lessonId, setLessonId] = useState(DEFAULT_LESSON_ID)
  const [metadataText, setMetadataText] = useState(DEFAULT_METADATA)
  const [result, setResult] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)

  async function run(actionName, task) {
    setPendingAction(actionName)
    setFeedback(null)
    try {
      const outcome = await task()
      setResult({ record: outcome.record })
      setFeedback({ type: 'success', text: outcome.message })
    } catch (error) {
      setFeedback({ type: 'error', text: error.message })
    } finally {
      setPendingAction(null)
    }
  }

  const handleStart = () =>
    run('start', async () => {
      const record = await saveProgress(lessonId, 'in_progress')
      return { record, message: 'Lesson started. Showing the record returned by saveProgress.' }
    })

  const handleSave = () =>
    run('save', async () => {
      const metadata = parseMetadataText(metadataText)
      const record = await saveProgress(lessonId, 'in_progress', metadata)
      return { record, message: 'Progress saved with the metadata shown below.' }
    })

  const handleComplete = () =>
    run('complete', async () => {
      const record = await saveProgress(lessonId, 'completed')
      return { record, message: 'Lesson marked completed.' }
    })

  const handleRetrieve = () =>
    run('retrieve', async () => {
      const record = await getLessonProgress(lessonId)
      return {
        record,
        message: record
          ? 'Loaded the saved progress from the database.'
          : 'No progress row exists for this lesson yet.',
      }
    })

  const handleRestart = () =>
    run('restart', async () => {
      await resetProgress(lessonId)
      const record = await getLessonProgress(lessonId)
      return {
        record,
        message: record
          ? 'Lesson restarted. Status and completed_at were cleared; attempts_count was kept.'
          : 'Restart ran, but no row exists for this lesson, so nothing changed.',
      }
    })

  const isBusy = pendingAction !== null
  const record = result?.record

  return (
    <section className="dev-progress-test">
      <h1>Progress Test (development only)</h1>
      <p className="auth-note">
        Signed in as <strong>{user?.email ?? 'unknown account'}</strong>. Writes run only when you
        click a button. Use an adult-owned test account.
      </p>

      <div className="auth-form">
        <label htmlFor="dev-lesson-select">Lesson</label>
        <select
          id="dev-lesson-select"
          value={lessonId}
          disabled={isBusy}
          onChange={(event) => {
            setLessonId(event.target.value)
            setResult(null)
            setFeedback(null)
          }}
        >
          {LESSONS.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.id} — {lesson.title}
            </option>
          ))}
        </select>

        <label htmlFor="dev-metadata">Metadata for Save progress (JSON object)</label>
        <textarea
          id="dev-metadata"
          rows={3}
          value={metadataText}
          disabled={isBusy}
          onChange={(event) => setMetadataText(event.target.value)}
        />

        <div className="dev-progress-test-actions">
          <button type="button" className="btn" disabled={isBusy} onClick={handleStart}>
            Start lesson (write)
          </button>
          <button type="button" className="btn" disabled={isBusy} onClick={handleSave}>
            Save progress (write)
          </button>
          <button type="button" className="btn" disabled={isBusy} onClick={handleComplete}>
            Mark completed (write)
          </button>
          <button type="button" className="btn" disabled={isBusy} onClick={handleRetrieve}>
            Retrieve saved progress (read)
          </button>
          <button type="button" className="btn" disabled={isBusy} onClick={handleRestart}>
            Restart lesson (write)
          </button>
        </div>

        {feedback?.type === 'success' && (
          <p className="auth-success" role="status">
            {feedback.text}
          </p>
        )}
        {feedback?.type === 'error' && (
          <p className="auth-error" role="alert">
            {feedback.text}
          </p>
        )}
      </div>

      <div className="auth-form dev-progress-test-result">
        <h2>Returned progress</h2>
        {result === null && <p>Run an action to see the result.</p>}
        {result !== null && record === null && <p>No progress row exists for this lesson.</p>}
        {record && (
          <dl>
            <dt>Status</dt>
            <dd>{record.status}</dd>
            <dt>attempts_count</dt>
            <dd>{record.attempts_count}</dd>
            <dt>completed_at</dt>
            <dd>{record.completed_at ?? 'null'}</dd>
            <dt>last_accessed_at</dt>
            <dd>{record.last_accessed_at ?? 'null'}</dd>
            <dt>metadata</dt>
            <dd>
              <code>{JSON.stringify(record.metadata)}</code>
            </dd>
          </dl>
        )}
      </div>
    </section>
  )
}

export default ProgressTestPage
