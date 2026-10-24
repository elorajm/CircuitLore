import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Home from '../pages/Home.jsx'

function HomeRoute() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <p className="loading-message">Checking your session&hellip;</p>
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Home />
}

export default HomeRoute
