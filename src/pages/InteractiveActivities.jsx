import PlaceholderPage from '../components/PlaceholderPage.jsx'
import { QuizIcon } from '../components/icons.jsx'

function InteractiveActivities() {
  return (
    <PlaceholderPage
      icon={QuizIcon}
      eyebrow="Interactive Activities"
      title="Quizzes & Challenges"
      description="Practice what you learn with multiple-choice questions, challenges, and immediate feedback."
      plannedFeatures={[
        'Multiple-choice and true/false questions',
        'Immediate feedback on answers',
        'Retry options',
        'Saved quiz results',
      ]}
    />
  )
}

export default InteractiveActivities
