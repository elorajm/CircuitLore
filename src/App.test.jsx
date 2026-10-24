import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'
import { supabase } from './services/supabaseClient.js'
import { getLessonProgress, getProgress } from './services/progressService.js'

// App now renders AuthProvider, which calls Supabase on mount. Mock it so
// these tests stay fast, offline, and never touch a real Supabase project.
vi.mock('./services/supabaseClient.js', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))

vi.mock('./services/progressService.js', () => ({
  getLessonProgress: vi.fn(),
  getProgress: vi.fn(),
  saveProgress: vi.fn(),
}))

const student = {
  id: 'student-1',
  email: 'ada@example.com',
  user_metadata: { display_name: 'Ada' },
}

function signInAs(user) {
  supabase.auth.getSession.mockResolvedValue({ data: { session: { user } }, error: null })
}

function renderApp(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  )
}

function navbar() {
  return document.querySelector('.navbar')
}

beforeEach(() => {
  vi.clearAllMocks()
  supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
  supabase.auth.signOut.mockResolvedValue({ error: null })
  getLessonProgress.mockResolvedValue(null)
  getProgress.mockResolvedValue([])
})

describe('Home page', () => {
  it('renders the CircuitLore homepage', async () => {
    renderApp('/')

    expect(await screen.findByRole('heading', { level: 1, name: 'CircuitLore' })).toBeInTheDocument()
    expect(
      screen.getByText('Discover the Story. Build the Circuit. Power the Future.'),
    ).toBeInTheDocument()
  })

  it('navigates to the Learning Journey page when "Begin the Journey" is clicked', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(await screen.findByRole('link', { name: 'Begin the Journey' }))

    expect(
      screen.getByRole('heading', { level: 1, name: 'Your Electricity Adventure' }),
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

describe('History timeline', () => {
  it('renders the History page with the timeline and the first milestone selected', () => {
    renderApp('/history')

    expect(screen.getByRole('heading', { level: 1, name: 'Meet the Discoverers' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Thales and rubbed amber/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('sends a logged-out visitor from the timeline lesson link to /login', async () => {
    const user = userEvent.setup()
    renderApp('/history')

    await user.click(await screen.findByRole('link', { name: 'Start lesson' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'Log In' })).toBeInTheDocument()
  })
})

describe('Protected routes', () => {
  it('redirects an unauthenticated visitor from /dashboard to /login', async () => {
    renderApp('/dashboard')

    expect(await screen.findByRole('heading', { level: 1, name: 'Log In' })).toBeInTheDocument()
  })

  it('redirects an unauthenticated visitor from a lesson route to /login', async () => {
    renderApp('/journey/history-001')

    expect(await screen.findByRole('heading', { level: 1, name: 'Log In' })).toBeInTheDocument()
  })

  it('redirects an unauthenticated visitor from the dev progress test page to /login', async () => {
    renderApp('/dev/progress-test')

    expect(await screen.findByRole('heading', { level: 1, name: 'Log In' })).toBeInTheDocument()
  })

  it('lets a signed-in student open /dashboard', async () => {
    signInAs(student)
    renderApp('/dashboard')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Welcome back, Ada!' }),
    ).toBeInTheDocument()
  })
})

describe('Signed-in home route', () => {
  it('sends a signed-in student from / to the dashboard', async () => {
    signInAs(student)
    renderApp('/')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Welcome back, Ada!' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Discover the Story. Build the Circuit. Power the Future.')).not.toBeInTheDocument()
  })
})

describe('Navigation by sign-in state', () => {
  it('shows visitors the Home link and the Log In and Sign Up actions only', async () => {
    renderApp('/history')

    expect(await within(navbar()).findByRole('link', { name: 'Log In' })).toBeInTheDocument()
    expect(within(navbar()).getByRole('link', { name: 'Sign Up' })).toHaveAttribute('href', '/signup')
    expect(within(navbar()).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(within(navbar()).queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument()
    expect(within(navbar()).queryByRole('link', { name: 'Circuit Lab' })).not.toBeInTheDocument()
  })

  it('shows signed-in students the student links and their name, without Home or Log In', async () => {
    signInAs(student)
    renderApp('/history')

    expect(await within(navbar()).findByText('Hi, Ada')).toBeInTheDocument()
    expect(within(navbar()).getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard')
    expect(within(navbar()).getByRole('link', { name: 'My Journey' })).toHaveAttribute('href', '/journey')
    expect(within(navbar()).getByRole('link', { name: 'History' })).toHaveAttribute('href', '/history')
    expect(within(navbar()).getByRole('link', { name: 'Lessons' })).toHaveAttribute('href', '/lessons')
    expect(within(navbar()).getByRole('link', { name: 'Circuit Lab' })).toHaveAttribute('href', '/circuit-lab')
    expect(within(navbar()).queryByRole('link', { name: 'Home' })).not.toBeInTheDocument()
    expect(within(navbar()).queryByRole('link', { name: 'Log In' })).not.toBeInTheDocument()
  })

  it('signs a student out from the navbar and returns them to the public home page', async () => {
    const user = userEvent.setup()
    signInAs(student)
    renderApp('/history')

    await user.click(await within(navbar()).findByRole('button', { name: 'Log Out' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'CircuitLore' })).toBeInTheDocument()
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1)
    expect(within(navbar()).getByRole('link', { name: 'Log In' })).toBeInTheDocument()
  })
})
