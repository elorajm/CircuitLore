import PlaceholderPage from '../components/PlaceholderPage.jsx'
import { ChartIcon } from '../components/icons.jsx'
import { useAuth } from '../hooks/useAuth.js'

function StudentDashboard() {
  const { user } = useAuth()
  const displayName = user?.user_metadata?.display_name || user?.email || 'Student'

  return (
    <PlaceholderPage
      icon={ChartIcon}
      eyebrow="Student Dashboard"
      title={`Welcome Back, ${displayName}`}
      description="You're logged in! This is where you'll continue your journey, see your current progress, and jump back into your last lesson. Progress tracking isn't built yet, so nothing is saved beyond your account login."
      plannedFeatures={[
        'Continue Your Journey shortcut',
        'Overall progress summary',
        'Recently completed lesson',
        'Circuit Lab status',
      ]}
    />
  )
}

export default StudentDashboard

