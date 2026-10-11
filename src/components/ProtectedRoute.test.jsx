import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

const { getSessionMock } = vi.hoisted(() => ({
  getSessionMock: vi.fn(),
}))

vi.mock('../services/supabaseClient.js', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: getSessionMock,
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))

function renderProtected() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<p>Login Page</p>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <p>Secret Content</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('ProtectedRoute', () => {
  it('redirects to /login when there is no active session', async () => {
    getSessionMock.mockResolvedValue({ data: { session: null }, error: null })

    renderProtected()

    expect(await screen.findByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Secret Content')).not.toBeInTheDocument()
  })

  it('renders the protected content when a session exists', async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: '1', email: 'student@example.com' } } },
      error: null,
    })

    renderProtected()

    expect(await screen.findByText('Secret Content')).toBeInTheDocument()
  })
})
