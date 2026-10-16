import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LearningJourney from './LearningJourney.jsx'

const { useAuthMock, getLessonProgressMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  getLessonProgressMock: vi.fn(),
}))

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => useAuthMock(),
}))

vi.mock('../services/progressService.js', () => ({
  getLessonProgress: getLessonProgressMock,
}))

const signedIn = { user: { id: 'student-1' }, loading: false }
const signedOut = { user: null, loading: false }

function record(status) {
  return { lesson_id: 'history-001', status, attempts_count: 1, metadata: {} }
}

function renderJourney() {
  return render(
    <MemoryRouter>
      <LearningJourney />
    </MemoryRouter>,
  )
}

describe('LearningJourney lesson status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a Completed badge and a review link when Supabase says the lesson is completed', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockResolvedValue(record('completed'))
    renderJourney()

    expect(await screen.findByText('Completed')).toBeInTheDocument()
    expect(getLessonProgressMock).toHaveBeenCalledWith('history-001')
    expect(screen.queryByRole('link', { name: 'Start Electricity Mysteries' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Review Electricity Mysteries' })).toHaveAttribute(
      'href',
      '/journey/history-001',
    )
  })

  it('offers Continue and no badge when the lesson is in progress', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockResolvedValue(record('in_progress'))
    renderJourney()

    expect(await screen.findByRole('link', { name: 'Continue Electricity Mysteries' })).toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })

  it('offers Start and no badge when the student has no progress row', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockResolvedValue(null)
    renderJourney()

    expect(await screen.findByRole('link', { name: 'Start Electricity Mysteries' })).toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })

  it('offers Start without checking progress for a signed-out visitor', async () => {
    useAuthMock.mockReturnValue(signedOut)
    renderJourney()

    expect(await screen.findByRole('link', { name: 'Start Electricity Mysteries' })).toBeInTheDocument()
    expect(getLessonProgressMock).not.toHaveBeenCalled()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })

  it('shows Start and a hint, never a badge, when progress cannot be loaded', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockRejectedValue(new Error('Failed to fetch lesson progress: boom'))
    renderJourney()

    expect(await screen.findByText(/We could not check your saved progress/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start Electricity Mysteries' })).toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })

  it('does not show a badge while the student is still being checked', () => {
    useAuthMock.mockReturnValue({ user: null, loading: true })
    renderJourney()

    expect(screen.getByRole('status')).toHaveTextContent('Checking your progress...')
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    expect(getLessonProgressMock).not.toHaveBeenCalled()
  })
})
