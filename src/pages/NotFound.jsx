import { Link } from 'react-router-dom'
import './NotFound.css'

function NotFound() {
  return (
    <section className="not-found">
      <p className="not-found-code">404</p>
      <h1>Page Not Found</h1>
      <p>The page you&apos;re looking for doesn&apos;t exist yet.</p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </section>
  )
}

export default NotFound
