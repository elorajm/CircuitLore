import HistoryTimeline from '../components/history/HistoryTimeline.jsx'
import timelineMilestones from '../content/history/timeline.js'
import '../components/history/HistoryTimeline.css'

function HistoricalExperience() {
  return (
    <main className="history-page">
      <header className="history-page-header">
        <p className="history-eyebrow">Historical Experience</p>
        <h1>Meet the Discoverers</h1>
        <p className="history-intro">
          Electricity was not discovered in one moment. Each step below built on the one before it.
          Pick a milestone to read what people figured out, and how it led to the next idea.
        </p>
      </header>

      <HistoryTimeline milestones={timelineMilestones} />
    </main>
  )
}

export default HistoricalExperience
