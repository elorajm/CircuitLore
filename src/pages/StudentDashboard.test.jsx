import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import StudentDashboard from './StudentDashboard.jsx'

const { useAuthMock, getLessonProgressMock, getProgressMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  getLessonProgressMock: vi.fn(),
  getProgressMock: vi.fn(),
}))

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => useAuthMock(),
}))

vi.mock('../services/progressService.js', () => ({
  getLessonProgress: getLessonProgressMock,
  getProgress: getProgressMock,
}))

const student = {
  id: 'student-1',
  email: 'student@example.com',
  user_metadata: { display_name: 'Ada' },
}
const signedIn = { user: student, loading: false }

function record(lessonId, status) {
  return { lesson_id: lessonId, status, attempts_count: 1, metadata: {} }
}

function renderDashboard() {
  return render(
    <MemoryRouter>
      <StudentDashboard />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  useAuthMock.mockReturnValue(signedIn)
  getLessonProgressMock.mockResolvedValue(null)
  getProgressMock.mockResolvedValue([])
})

describe('StudentDashboard greeting', () => {
  it('welcomes the student by display name', async () => {
    renderDashboard()

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome back, Ada!' })).toBeInTheDocument()
    await screen.findByRole('link', { name: 'Start Lesson' })
  })

  it('falls back to a friendly name when no display name is set', async () => {
    useAuthMock.mockReturnValue({ user: { id: 'student-1', email: 'student@example.com' }, loading: false })
    renderDashboard()

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome back, explorer!' })).toBeInTheDocument()
    expect(screen.queryByText(/student@example.com/)).not.toBeInTheDocument()
    await screen.findByRole('link', { name: 'Start Lesson' })
  })
})

describe('Your Next Adventure card', () => {
  it('offers Start Lesson to a student who has not started, linking to the lesson route', async () => {
    renderDashboard()

    const card = screen.getByRole('article', { name: 'Electricity Mysteries' })
    const link = await within(card).findByRole('link', { name: 'Start Lesson' })
    expect(link).toHaveAttribute('href', '/journey/history-001')
    expect(getLessonProgressMock).toHaveBeenCalledWith('history-001')
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })

  it('offers Continue Lesson and an In progress label when the saved status is in progress', async () => {
    getLessonProgressMock.mockResolvedValue(record('history-001', 'in_progress'))
    renderDashboard()

    expect(await screen.findByRole('link', { name: 'Continue Lesson' })).toHaveAttribute(
      'href',
      '/journey/history-001',
    )
    expect(screen.getByText('In progress')).toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })

  it('shows Completed and Review Lesson only when the saved row is completed', async () => {
    getLessonProgressMock.mockResolvedValue(record('history-001', 'completed'))
    renderDashboard()

    expect(await screen.findByRole('link', { name: 'Review Lesson' })).toHaveAttribute(
      'href',
      '/journey/history-001',
    )
    expect(screen.getByText('Completed')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Start Lesson' })).not.toBeInTheDocument()
  })

  it('shows the checking state with no lesson action while saved progress loads', () => {
    getLessonProgressMock.mockReturnValue(new Promise(() => {}))
    renderDashboard()

    expect(screen.getByText('Checking your progress...')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Start|Continue|Review/ })).not.toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })

  it('offers Start Lesson with a hint and never claims completion when progress cannot be loaded', async () => {
    getLessonProgressMock.mockRejectedValue(new Error('Failed to fetch lesson progress: boom'))
    renderDashboard()

    expect(await screen.findByText(/We could not check your saved progress/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start Lesson' })).toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })
})

describe('Progress overview', () => {
  it('counts playable lessons from the catalog and completed lessons from saved rows', async () => {
    getProgressMock.mockResolvedValue([record('history-001', 'completed')])
    renderDashboard()

    const playable = await screen.findByText('Playable lessons')
    expect(playable.nextElementSibling).toHaveTextContent('1')
    expect(screen.getByText('Lessons completed').nextElementSibling).toHaveTextContent('1')
    expect(
      screen.getByText('Only one lesson is playable right now. More adventures are on the way.'),
    ).toBeInTheDocument()
  })

  it('does not count completed rows for lessons that are not playable', async () => {
    getProgressMock.mockResolvedValue([record('history-999', 'completed')])
    renderDashboard()

    await screen.findByText('Playable lessons')
    expect(screen.getByText('Lessons completed').nextElementSibling).toHaveTextContent('0')
  })

  it('shows zero completed and an empty-state note when the student has no progress rows', async () => {
    renderDashboard()

    expect(await screen.findByText(/You have not started any lessons yet/)).toBeInTheDocument()
    expect(screen.getByText('Lessons completed').nextElementSibling).toHaveTextContent('0')
  })

  it('shows a loading status while the overview loads', () => {
    getProgressMock.mockReturnValue(new Promise(() => {}))
    renderDashboard()

    expect(screen.getByText('Loading your progress...')).toBeInTheDocument()
    expect(screen.queryByText('Lessons completed')).not.toBeInTheDocument()
  })

  it('shows an error without counts when the overview cannot be loaded', async () => {
    getProgressMock.mockRejectedValue(new Error('Failed to fetch progress: boom'))
    renderDashboard()

    expect(await screen.findByText(/We could not load your progress/)).toBeInTheDocument()
    expect(screen.queryByText('Lessons completed')).not.toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })
})

describe('Explore links', () => {
  it('links to My Journey, History, Lessons, and Circuit Lab, marking unbuilt pages as coming soon', async () => {
    renderDashboard()
    await screen.findByRole('link', { name: 'Start Lesson' })

    const section = screen.getByRole('region', { name: 'Explore CircuitLore' })
    expect(within(section).getByRole('link', { name: /My Journey/ })).toHaveAttribute('href', '/journey')
    expect(within(section).getByRole('link', { name: /History/ })).toHaveAttribute('href', '/history')

    const lessons = within(section).getByRole('link', { name: /Lessons/ })
    expect(lessons).toHaveAttribute('href', '/lessons')
    expect(within(lessons).getByText('Coming soon')).toBeInTheDocument()

    const lab = within(section).getByRole('link', { name: /Circuit Lab/ })
    expect(lab).toHaveAttribute('href', '/circuit-lab')
    expect(within(lab).getByText('Coming soon')).toBeInTheDocument()
  })
})

describe('Signed-out visitor', () => {
  it('asks the visitor to log in and makes no progress requests', () => {
    useAuthMock.mockReturnValue({ user: null, loading: false })
    renderDashboard()

    expect(screen.getByText('Log in to see your dashboard.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Log In' })).toHaveAttribute('href', '/login')
    expect(getLessonProgressMock).not.toHaveBeenCalled()
    expect(getProgressMock).not.toHaveBeenCalled()
  })
})
