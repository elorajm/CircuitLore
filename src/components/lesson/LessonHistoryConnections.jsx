import { Link } from 'react-router-dom'
import { historyConnectionsForLesson } from '../../content/history/connections.js'
import './Lesson.css'

function LessonHistoryConnections({ lessonId }) {
  const connections = historyConnectionsForLesson(lessonId)

  if (connections.length === 0) return null

  return (
    <aside className="lesson-history" aria-labelledby="lesson-history-title">
      <h2 id="lesson-history-title" className="lesson-history-title">
        Where these ideas came from
      </h2>

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
    </aside>
  )
}

export default LessonHistoryConnections
