import PlaceholderPage from '../components/PlaceholderPage.jsx'
import { ScrollIcon } from '../components/icons.jsx'

function HistoricalExperience() {
  return (
    <PlaceholderPage
      icon={ScrollIcon}
      eyebrow="Historical Experience"
      title="Meet the Discoverers"
      description="Interactive stories will introduce historical figures and the experiments that shaped our understanding of electricity."
      plannedFeatures={[
        'Historical figures and story scenes',
        'Dialogue and interactive experiments',
        'Animated presentation',
        'Connection to modern electrical concepts',
      ]}
    />
  )
}

export default HistoricalExperience
