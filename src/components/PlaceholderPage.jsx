import './PlaceholderPage.css'

/**
 * Shared layout for routes whose real functionality has not been built yet.
 * Keeps each page component small while clearly labeling unfinished features.
 */
function PlaceholderPage({ icon: Icon, eyebrow, title, description, plannedFeatures }) {
  return (
    <section className="placeholder-page">
      {Icon && (
        <span className="placeholder-icon">
          <Icon width={32} height={32} />
        </span>
      )}
      <span className="badge">Coming Soon</span>
      {eyebrow && <p className="placeholder-eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      <p className="placeholder-description">{description}</p>

      {plannedFeatures && plannedFeatures.length > 0 && (
        <div className="placeholder-planned">
          <h2>Planned Features</h2>
          <ul>
            {plannedFeatures.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

export default PlaceholderPage
