import { Link } from 'react-router-dom'
import { TrophyIcon } from '../icons.jsx'
import './Lesson.css'

function LessonComplete({ lessonTitle, quizScore, totalQuestions }) {
  return (
    <section className="lesson-complete">
      <div className="lesson-complete-icon" aria-hidden="true">
        <TrophyIcon width="56" height="56" />
      </div>

      <h2 id="lesson-step-title" className="lesson-complete-title">
        Congratulations!
      </h2>

      <p className="lesson-complete-message">You completed {lessonTitle}!</p>

      {quizScore !== null && (
        <p className="lesson-complete-score">
          {quizScore} out of {totalQuestions} correct
        </p>
      )}

      <p className="lesson-complete-saved" role="status">
        Your progress has been saved.
      </p>

      <Link className="btn btn-primary" to="/journey">
        Return to Learning Journey
      </Link>
    </section>
  )
}

export default LessonComplete
