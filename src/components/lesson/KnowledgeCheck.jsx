import { useState } from 'react'

function KnowledgeCheck({ questions, onChecked }) {
  const [answers, setAnswers] = useState({})
  const [checked, setChecked] = useState(false)

  const answeredAll = questions.every((question) => answers[question.id] !== undefined)
  const score = questions.filter((question) => answers[question.id] === question.answerIndex).length

  function choose(questionId, optionIndex) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
    setChecked(false)
  }

  function check() {
    setChecked(true)
    onChecked(score)
  }

  function tryAgain() {
    setAnswers({})
    setChecked(false)
  }

  let statusMessage = 'Choose an answer for every question.'
  if (checked) {
    statusMessage = `You got ${score} out of ${questions.length} correct.`
  } else if (answeredAll) {
    statusMessage = 'Ready to check your answers.'
  }

  return (
    <div className="knowledge-check">
      {questions.map((question, questionIndex) => {
        const selected = answers[question.id]
        const isCorrect = checked ? selected === question.answerIndex : null

        return (
          <fieldset key={question.id} className="knowledge-question">
            <legend>
              {questionIndex + 1}. {question.prompt}
            </legend>
            {question.options.map((option, optionIndex) => {
              const inputId = `${question.id}-option-${optionIndex}`
              return (
                <div className="knowledge-option" key={inputId}>
                  <input
                    type="radio"
                    id={inputId}
                    name={`quiz-${question.id}`}
                    value={optionIndex}
                    checked={selected === optionIndex}
                    onChange={() => choose(question.id, optionIndex)}
                  />
                  <label htmlFor={inputId}>{option}</label>
                </div>
              )
            })}
            {isCorrect !== null && (
              <div className={`knowledge-feedback ${isCorrect ? 'is-correct' : 'is-incorrect'}`}>
                <p className="knowledge-feedback-verdict">
                  {isCorrect
                    ? 'Correct.'
                    : `Not quite. The answer is "${question.options[question.answerIndex]}".`}
                </p>
                <p>{question.explanation}</p>
              </div>
            )}
          </fieldset>
        )
      })}

      <p className="knowledge-status" role="status">
        {statusMessage}
      </p>

      <div className="lesson-quiz-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={check}
          disabled={!answeredAll || checked}
        >
          Check answers
        </button>
        {checked && (
          <button type="button" className="btn btn-secondary" onClick={tryAgain}>
            Try again
          </button>
        )}
      </div>
    </div>
  )
}

export default KnowledgeCheck
