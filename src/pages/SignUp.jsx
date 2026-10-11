import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import './AuthForm.css'

const MIN_PASSWORD_LENGTH = 6

function SignUp() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState('student')
  const [formError, setFormError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setInfoMessage('')

    if (!displayName.trim() || !email.trim() || !password) {
      setFormError('Please fill in all required fields.')
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    const { error, needsEmailConfirmation } = await signUp({
      email: email.trim(),
      password,
      displayName: displayName.trim(),
      requestedRole: role,
    })
    setIsSubmitting(false)

    if (error) {
      setFormError(error)
      return
    }

    if (needsEmailConfirmation) {
      setInfoMessage(
        'Account created! Check your email to confirm your account before logging in.',
      )
      return
    }

    navigate('/dashboard', { replace: true })
  }

  return (
    <section className="auth-page">
      <h1>Sign Up</h1>
      <p className="auth-note">
        Create a CircuitLore account to save your learning progress.
      </p>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="signup-name">Display Name</label>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          disabled={isSubmitting}
        />

        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
        />

        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
        />

        <label htmlFor="signup-confirm-password">Confirm Password</label>
        <input
          id="signup-confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          disabled={isSubmitting}
        />

        <label htmlFor="signup-role">I am a&hellip;</label>
        <select
          id="signup-role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          disabled={isSubmitting}
        >
          <option value="student">Student</option>
          <option value="adult">Parent / Teacher</option>
        </select>
        <p className="auth-helper-text">
          This only personalizes your experience right now — it does not grant
          any special account access.
        </p>

        {formError && (
          <p className="auth-error" role="alert">
            {formError}
          </p>
        )}

        {infoMessage && (
          <p className="auth-success" role="status">
            {infoMessage}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </section>
  )
}

export default SignUp

