import PlaceholderPage from '../components/PlaceholderPage.jsx'
import { CircuitIcon } from '../components/icons.jsx'

function CircuitLab() {
  return (
    <PlaceholderPage
      icon={CircuitIcon}
      eyebrow="Virtual Circuit Lab"
      title="Build a Circuit"
      description="A hands-on workspace for building and testing electrical circuits with batteries, wires, bulbs, switches, and resistors."
      plannedFeatures={[
        'Component toolbox (battery, wire, bulb, switch, resistor)',
        'Drag, connect, and remove components',
        'Circuit validation and feedback',
        'Clear and reset circuit workspace',
      ]}
    />
  )
}

export default CircuitLab
