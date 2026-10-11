import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx'
import Login from './Login.jsx'

const { signInWithPasswordMock } = vi.hoisted(() => ({
  signInWithPasswordMock: vi.fn(),
}))

vi.mock('../services/supabaseClient.js', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: signInWithPasswordMock,
      signUp: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<p>Dashboard Page</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('Login form', () => {
  it('shows a validation error when submitted empty', async () => {
    const user = userEvent.setup()
    renderLogin()

    await user.click(screen.getByRole('button', { name: 'Log In' }))

    expect(
      await screen.findByText('Please enter your email and password.'),
    ).toBeInTheDocument()
    expect(signInWithPasswordMock).not.toHaveBeenCalled()
  })

  it('shows the error message returned by Supabase when login fails', async () => {
    signInWithPasswordMock.mockResolvedValueOnce({
      data: { session: null },
      error: { message: 'Invalid login credentials' },
    })
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email'), 'student@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Log In' }))

    expect(await screen.findByText('Invalid login credentials')).toBeInTheDocument()
  })

  it('navigates to the dashboard after a successful login', async () => {
    signInWithPasswordMock.mockResolvedValueOnce({
      data: { session: { user: { id: '1', email: 'student@example.com' } } },
      error: null,
    })
    const user = userEvent.setup()
    renderLogin()

    await user.type(screen.getByLabelText('Email'), 'student@example.com')
    await user.type(screen.getByLabelText('Password'), 'correct-password')
    await user.click(screen.getByRole('button', { name: 'Log In' }))

    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument()
  })
})
