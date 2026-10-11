import PlaceholderPage from '../components/PlaceholderPage.jsx'
import { BulbIcon } from '../components/icons.jsx'

function ElectricityLessons() {
  return (
    <PlaceholderPage
      icon={BulbIcon}
      eyebrow="Electricity Lessons"
      title="Understanding Electricity"
      description="Lessons here will explain core electrical concepts like charge, current, voltage, resistance, conductors, and insulators."
      plannedFeatures={[
        'Written explanations and visual examples',
        'Real-world examples',
        'Lesson completion tracking',
        'Links to related activities',
      ]}
    />
  )
}

export default ElectricityLessons
