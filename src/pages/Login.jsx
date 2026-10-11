import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import './AuthForm.css'

function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')

    if (!email.trim() || !password) {
      setFormError('Please enter your email and password.')
      return
    }

    setIsSubmitting(true)
    const { error } = await signIn({ email: email.trim(), password })
    setIsSubmitting(false)

    if (error) {
      setFormError(error)
      return
    }

    navigate(redirectTo, { replace: true })
  }

  return (
    <section className="auth-page">
      <h1>Log In</h1>
      <p className="auth-note">
        Log in with your CircuitLore account to continue your learning journey.
      </p>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="********"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
        />

        {formError && (
          <p className="auth-error" role="alert">
            {formError}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Logging In…' : 'Log In'}
        </button>
      </form>

      <p className="auth-switch">
        Don&apos;t have an account? <Link to="/signup">Sign up</Link>
      </p>
    </section>
  )
}

export default Login

