import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BoltIcon } from './icons.jsx'
import { useAuth } from '../hooks/useAuth.js'
import './NavBar.css'

const studentLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/journey', label: 'My Journey' },
  { to: '/history', label: 'History' },
  { to: '/lessons', label: 'Lessons' },
  { to: '/circuit-lab', label: 'Circuit Lab' },
]

const visitorLinks = [{ to: '/', label: 'Home', end: true }]

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, loading, user, signOut } = useAuth()
  const navigate = useNavigate()
  const navLinks = loading ? [] : isAuthenticated ? studentLinks : visitorLinks

  const closeMenu = () => setIsMenuOpen(false)

  const handleLogout = async () => {
    closeMenu()
    await signOut()
    navigate('/')
  }

  const displayName = user?.user_metadata?.display_name || user?.email || 'Student'

  return (
    <nav className="navbar">
      <div className="navbar-row">
        <NavLink to="/" className="navbar-brand" onClick={closeMenu}>
          <BoltIcon className="navbar-brand-icon" />
          CircuitLore
        </NavLink>

        <button
          type="button"
          className="navbar-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="navbar-toggle-bar" />
          <span className="navbar-toggle-bar" />
          <span className="navbar-toggle-bar" />
        </button>
      </div>

      <div className={`navbar-links ${isMenuOpen ? 'is-open' : ''}`}>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `navbar-link${isActive ? ' is-active' : ''}`
            }
            onClick={closeMenu}
          >
            {link.label}
          </NavLink>
        ))}

        <div className="navbar-auth">
          {loading ? null : isAuthenticated ? (
            <>
              <span className="navbar-user">Hi, {displayName}</span>
              <button type="button" className="navbar-logout" onClick={handleLogout}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="navbar-link" onClick={closeMenu}>
                Log In
              </NavLink>
              <NavLink
                to="/signup"
                className="navbar-link navbar-link-cta"
                onClick={closeMenu}
              >
                Sign Up
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default NavBar

