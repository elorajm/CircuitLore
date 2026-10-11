import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BoltIcon } from './icons.jsx'
import { useAuth } from '../hooks/useAuth.js'
import './NavBar.css'

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/journey', label: 'Learning Journey' },
  { to: '/history', label: 'History' },
  { to: '/lessons', label: 'Lessons' },
  { to: '/activities', label: 'Activities' },
  { to: '/circuit-lab', label: 'Circuit Lab' },
  { to: '/dashboard', label: 'Dashboard' },
]

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user, signOut } = useAuth()
  const navigate = useNavigate()

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
          {isAuthenticated ? (
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

