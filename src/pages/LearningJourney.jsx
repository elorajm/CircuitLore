import PlaceholderPage from '../components/PlaceholderPage.jsx'
import { MapIcon } from '../components/icons.jsx'

function LearningJourney() {
  return (
    <PlaceholderPage
      icon={MapIcon}
      eyebrow="Learning Journey"
      title="The Electricity Journey"
      description="The full learning path will guide you from historical discoveries into modern electrical concepts, unlocking new sections as you go."
      plannedFeatures={[
        'Journey map with current location',
        'Lesson order and unlocking',
        'Historical-to-modern timeline',
        'Navigation between learning sections',
      ]}
    />
  )
}

export default LearningJourney
