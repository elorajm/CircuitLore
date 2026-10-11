import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="site-footer">
      <nav className="site-footer-links">
        <Link to="/adult-dashboard">Parent/Teacher Dashboard</Link>
        <Link to="/admin">Admin Content Management</Link>
      </nav>

      <p>CircuitLore &mdash; BYU-Idaho CSE 499 Senior Project</p>
      <p className="site-footer-note">
        Educational prototype in active development. Features marked as
        placeholders are not yet implemented.
      </p>
    </footer>
  )
}

export default Footer
