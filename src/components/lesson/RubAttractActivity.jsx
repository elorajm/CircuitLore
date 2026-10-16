import { useState } from 'react'
import './RubAttractActivity.css'

const RUBS_NEEDED = 3
const ATTRACTED_LEFT = 74

const PAPER_PIECES = [
  { id: 'paper-1', left: 10, top: 20 },
  { id: 'paper-2', left: 26, top: 58 },
  { id: 'paper-3', left: 14, top: 74 },
  { id: 'paper-4', left: 38, top: 36 },
  { id: 'paper-5', left: 30, top: 82 },
  { id: 'paper-6', left: 50, top: 14 },
  { id: 'paper-7', left: 46, top: 62 },
  { id: 'paper-8', left: 56, top: 88 },
]

function RubAttractActivity({ onCompleted }) {
  const [rubs, setRubs] = useState(0)
  const [pulled, setPulled] = useState(false)

  const charged = rubs >= RUBS_NEEDED

  function rub() {
    setRubs((count) => Math.min(count + 1, RUBS_NEEDED))
  }

  function holdNearPaper() {
    if (!charged) return
    setPulled(true)
    onCompleted?.()
  }

  function startOver() {
    setRubs(0)
    setPulled(false)
  }

  let feedback = 'Press "Rub the rod" three times to charge it with the cloth.'
  if (pulled) {
    feedback =
      'The paper bits jumped toward the rod. Charges inside each bit shifted, so the side nearest the rod became the opposite charge and was pulled in.'
  } else if (charged) {
    feedback = 'The rod is charged. Now hold it near the paper bits.'
  } else if (rubs > 0) {
    feedback = `Rubbed ${rubs} of ${RUBS_NEEDED} times. The rod is not charged yet.`
  }

  return (
    <div className="rub-activity">
      <div className="rub-stage" aria-hidden="true">
        {PAPER_PIECES.map((piece) => (
          <span
            key={piece.id}
            className="rub-paper"
            style={{
              left: `${pulled ? ATTRACTED_LEFT + (piece.top % 9) : piece.left}%`,
              top: `${piece.top}%`,
            }}
          />
        ))}
        <div
          key={rubs}
          className={`rub-rod${rubs > 0 && !pulled ? ' is-rubbing' : ''}${charged ? ' is-charged' : ''}`}
        >
          <span className="rub-rod-label">Rod</span>
        </div>
      </div>

      <p className="rub-feedback" role="status" aria-live="polite">
        {feedback}
      </p>

      <p className="rub-progress">
        Rubs: {rubs} of {RUBS_NEEDED}
      </p>

      <div className="rub-actions">
        <button type="button" className="btn btn-secondary" onClick={rub} disabled={charged}>
          Rub the rod
        </button>
        <button type="button" className="btn btn-primary" onClick={holdNearPaper} disabled={!charged}>
          Hold rod near the paper
        </button>
        <button type="button" className="btn btn-secondary" onClick={startOver} disabled={rubs === 0 && !pulled}>
          Start over
        </button>
      </div>
    </div>
  )
}

export default RubAttractActivity
