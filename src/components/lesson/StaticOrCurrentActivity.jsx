import { useState } from 'react'

const STATIC = 'static'
const CURRENT = 'current'

const CHOICES = [
  { value: STATIC, label: 'Static electricity' },
  { value: CURRENT, label: 'Electric current' },
]

const EXAMPLES = [
  {
    id: 'balloon-wall',
    text: 'You rub a balloon on your hair, then it sticks to the wall.',
    answer: STATIC,
    explanation:
      'The charge stays on the balloon and pulls on the wall. Nothing is flowing around a loop.',
  },
  {
    id: 'flashlight',
    text: 'A flashlight glows when you close its switch, with batteries inside.',
    answer: CURRENT,
    explanation:
      'Closing the switch completes a loop. Charge keeps moving from the battery through the bulb and back.',
  },
  {
    id: 'doorknob-spark',
    text: 'You shuffle across carpet, then touch a metal doorknob and feel a small zap.',
    answer: STATIC,
    explanation:
      'Charge built up on your body and jumped to the doorknob in one quick spark. That is static electricity.',
  },
  {
    id: 'fan',
    text: 'A battery-powered fan keeps spinning while its switch is on.',
    answer: CURRENT,
    explanation:
      'Charge keeps flowing through a complete loop to the motor, so the fan keeps turning.',
  },
]

// Hints do not give the answer away. The student has to think about it and try again.
const HINT = 'Not quite. Ask yourself: does the charge stay in one place, or keep moving around a complete loop?'

function StaticOrCurrentActivity({ onCompleted }) {
  const [picks, setPicks] = useState({})
  const [completed, setCompleted] = useState(false)

  const correctCount = EXAMPLES.filter((example) => picks[example.id] === example.answer).length

  function choose(exampleId, choice) {
    const nextPicks = { ...picks, [exampleId]: choice }
    const allCorrect = EXAMPLES.every((example) => nextPicks[example.id] === example.answer)

    setPicks(nextPicks)
    if (allCorrect && !completed) {
      setCompleted(true)
      onCompleted?.()
    }
  }

  let statusMessage = `Correct so far: ${correctCount} of ${EXAMPLES.length}.`
  if (completed) {
    statusMessage = 'All four examples are sorted correctly. You can continue when you are ready.'
  }

  return (
    <div className="knowledge-check">
      {EXAMPLES.map((example, index) => {
        const selected = picks[example.id]
        const isCorrect = selected === undefined ? null : selected === example.answer

        return (
          <fieldset key={example.id} className="knowledge-question">
            <legend>
              {index + 1}. {example.text}
            </legend>
            {CHOICES.map((choice) => {
              const inputId = `${example.id}-${choice.value}`
              return (
                <div className="knowledge-option" key={inputId}>
                  <input
                    type="radio"
                    id={inputId}
                    name={`sort-${example.id}`}
                    value={choice.value}
                    checked={selected === choice.value}
                    onChange={() => choose(example.id, choice.value)}
                  />
                  <label htmlFor={inputId}>{choice.label}</label>
                </div>
              )
            })}
            {isCorrect !== null && (
              <div className={`knowledge-feedback ${isCorrect ? 'is-correct' : 'is-incorrect'}`}>
                <p className="knowledge-feedback-verdict">{isCorrect ? 'Correct.' : HINT}</p>
                {isCorrect && <p>{example.explanation}</p>}
              </div>
            )}
          </fieldset>
        )
      })}

      <p className="knowledge-status" role="status">
        {statusMessage}
      </p>
    </div>
  )
}

export default StaticOrCurrentActivity
