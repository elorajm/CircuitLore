import { Link } from 'react-router-dom'
import { historyConnectionsForLesson } from '../../content/history/connections.js'
import './Lesson.css'

function LessonHistoryConnections({ lessonId }) {
  const connections = historyConnectionsForLesson(lessonId)

  if (connections.length === 0) return null

  const count = connections.length
  const countLabel = count === 1 ? '1 discovery' : `${count} discoveries`

  return (
    <aside className="lesson-history" aria-label="Where these ideas came from">
      <details className="lesson-history-details">
        <summary className="lesson-history-summary">
          <span className="lesson-history-heading">Where these ideas came from</span>
          <span className="lesson-history-count">{countLabel} behind this lesson</span>
        </summary>

        <ul className="lesson-history-list">
          {connections.map(({ milestone }, index) => (
            <li key={`${milestone.id}-${index}`}>
              <Link to={`/history#${milestone.id}`}>
                {milestone.displayDate}: {milestone.shortName}
              </Link>
              <p>{milestone.summary}</p>
            </li>
          ))}
        </ul>

        <Link className="btn btn-secondary" to="/history">
          Back to the timeline
        </Link>
      </details>
    </aside>
  )
}

export default LessonHistoryConnections
