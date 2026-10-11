import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'

// App now renders AuthProvider, which calls Supabase on mount. Mock it so
// these tests stay fast, offline, and never touch a real Supabase project.
vi.mock('./services/supabaseClient.js', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}))

function renderApp(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  )
}

describe('Home page', () => {
  it('renders the CircuitLore homepage', () => {
    renderApp('/')

    expect(screen.getByRole('heading', { level: 1, name: 'CircuitLore' })).toBeInTheDocument()
    expect(
      screen.getByText('Discover the Story. Build the Circuit. Power the Future.'),
    ).toBeInTheDocument()
  })

  it('navigates to the Learning Journey page when "Begin the Journey" is clicked', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(screen.getByRole('link', { name: 'Begin the Journey' }))

    expect(
      screen.getByRole('heading', { level: 1, name: 'The Electricity Journey' }),
    ).toBeInTheDocument()
  })
})

describe('Unknown routes', () => {
  it('shows the 404 page for an unmatched route', () => {
    renderApp('/this-route-does-not-exist')

    expect(screen.getByRole('heading', { level: 1, name: 'Page Not Found' })).toBeInTheDocument()
    expect(screen.getByText('404')).toBeInTheDocument()
  })
})

describe('Protected routes', () => {
  it('redirects an unauthenticated visitor from /dashboard to /login', async () => {
    renderApp('/dashboard')

    expect(await screen.findByRole('heading', { level: 1, name: 'Log In' })).toBeInTheDocument()
  })
})
