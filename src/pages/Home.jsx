import { Link } from 'react-router-dom'
import { ScrollIcon, BulbIcon, CircuitIcon, ChartIcon } from '../components/icons.jsx'
import './Home.css'

const featureHighlights = [
  {
    title: 'Historical Storytelling',
    description:
      'Meet the people behind key discoveries in the history of electricity.',
    icon: ScrollIcon,
    to: '/history',
  },
  {
    title: 'Electricity Lessons',
    description:
      'Learn core concepts like current, voltage, and resistance step by step.',
    icon: BulbIcon,
    to: '/lessons',
  },
  {
    title: 'Virtual Circuit Lab',
    description:
      'Build and test real electrical circuits in an interactive workspace.',
    icon: CircuitIcon,
    to: '/circuit-lab',
  },
  {
    title: 'Saved Progress',
    description:
      'Pick up right where you left off every time you come back.',
    icon: ChartIcon,
    to: '/dashboard',
  },
]

function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">CSE 499 Senior Project</p>

          <h1>CircuitLore</h1>

          <h2>Discover the Story. Build the Circuit. Power the Future.</h2>

          <p className="hero-intro">
            Travel through the history of electricity, meet the people behind
            important discoveries, and learn how their ideas power the world
            around us today.
          </p>

          <div className="hero-actions">
            <Link to="/journey" className="btn btn-primary">
              Begin the Journey
            </Link>
            <Link to="/signup" className="btn btn-secondary">
              Create a Free Account
            </Link>
          </div>
        </div>
      </section>

      <section className="feature-grid" aria-label="What you'll explore">
        {featureHighlights.map((feature) => {
          const Icon = feature.icon
          return (
            <Link key={feature.title} to={feature.to} className="feature-card">
              <span className="feature-icon">
                <Icon />
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </Link>
          )
        })}
      </section>
    </div>
  )
}

export default Home
