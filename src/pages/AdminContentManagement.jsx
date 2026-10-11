import PlaceholderPage from '../components/PlaceholderPage.jsx'
import { GearIcon } from '../components/icons.jsx'

function AdminContentManagement() {
  return (
    <PlaceholderPage
      icon={GearIcon}
      eyebrow="Admin Content Management"
      title="Manage Learning Content"
      description="Authorized administrators will be able to create, edit, and organize lessons, historical content, questions, and circuit challenges here."
      plannedFeatures={[
        'Create and edit lessons',
        'Manage historical content',
        'Manage quiz questions and circuit challenges',
        'Control content order',
      ]}
    />
  )
}

export default AdminContentManagement
