import PlaceholderPage from '../components/PlaceholderPage.jsx'
import { UsersIcon } from '../components/icons.jsx'

function AdultDashboard() {
  return (
    <PlaceholderPage
      icon={UsersIcon}
      eyebrow="Parent / Teacher Dashboard"
      title="Student Progress Overview"
      description="Once connected to a student account, approved adults will be able to view learning progress here."
      plannedFeatures={[
        'Connect to a student account',
        'Completed lessons and quiz results',
        'Circuit challenge progress',
        'Areas needing more practice',
      ]}
    />
  )
}

export default AdultDashboard
