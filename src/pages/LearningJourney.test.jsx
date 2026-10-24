import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
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

function renderJourney(initialEntries = ['/journey']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/journey" element={<LearningJourney />} />
        <Route path="/journey/:lessonId" element={<p>Lesson route opened</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

function lessonCard() {
  return screen.getByRole('article', { name: 'Electricity Mysteries' })
}

function futureSection() {
  return screen.getByRole('region', { name: 'Coming Up on Your Journey' })
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
    expect(screen.queryByRole('link', { name: 'Start Lesson' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Review Lesson' })).toHaveAttribute(
      'href',
      '/journey/history-001',
    )
  })

  it('offers Continue Lesson and an In progress label when the lesson is in progress', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockResolvedValue(record('in_progress'))
    renderJourney()

    expect(await screen.findByRole('link', { name: 'Continue Lesson' })).toBeInTheDocument()
    expect(screen.getByText('In progress')).toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })

  it('offers Start Lesson with no label when the student has no progress row', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockResolvedValue(null)
    renderJourney()

    expect(await screen.findByRole('link', { name: 'Start Lesson' })).toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    expect(screen.queryByText('In progress')).not.toBeInTheDocument()
  })

  it('offers Start Lesson without checking progress for a signed-out visitor', async () => {
    useAuthMock.mockReturnValue(signedOut)
    renderJourney()

    expect(await screen.findByRole('link', { name: 'Start Lesson' })).toBeInTheDocument()
    expect(getLessonProgressMock).not.toHaveBeenCalled()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })

  it('shows Start Lesson and a hint, never a badge, when progress cannot be loaded', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockRejectedValue(new Error('Failed to fetch lesson progress: boom'))
    renderJourney()

    expect(await screen.findByText(/We could not check your saved progress/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start Lesson' })).toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })

  it('shows only the checking status, with no lesson action, while the student is being checked', () => {
    useAuthMock.mockReturnValue({ user: null, loading: true })
    renderJourney()

    expect(screen.getByRole('status')).toHaveTextContent('Checking your progress...')
    expect(screen.queryByRole('link', { name: /Start|Continue|Review/ })).not.toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    expect(getLessonProgressMock).not.toHaveBeenCalled()
  })
})

describe('LearningJourney layout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthMock.mockReturnValue(signedOut)
  })

  it('no longer shows the placeholder badge or planned features list', async () => {
    renderJourney()

    expect(await screen.findByRole('link', { name: 'Start Lesson' })).toBeInTheDocument()
    expect(screen.queryByText('Coming Soon')).not.toBeInTheDocument()
    expect(screen.queryByText('Planned Features')).not.toBeInTheDocument()
    expect(screen.queryByText('Journey map with current location')).not.toBeInTheDocument()
  })

  it('introduces the journey with a heading and welcome text', async () => {
    renderJourney()

    expect(screen.getByRole('heading', { level: 1, name: 'The Electricity Journey' })).toBeInTheDocument()
    expect(screen.getByText(/Welcome, explorer!/)).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Start Lesson' })).toBeInTheDocument()
  })

  it('shows Chapter 1 with the Electricity Mysteries lesson card and its activity and quiz', async () => {
    renderJourney()

    expect(
      screen.getByRole('heading', { level: 2, name: 'Chapter 1: The First Sparks' }),
    ).toBeInTheDocument()

    const card = lessonCard()
    expect(within(card).getByRole('heading', { level: 3, name: 'Electricity Mysteries' })).toBeInTheDocument()
    expect(within(card).getByText('Activity: Rub and Attract')).toBeInTheDocument()
    expect(within(card).getByText('Quiz: Knowledge Check')).toBeInTheDocument()
    expect(await within(card).findByRole('link', { name: 'Start Lesson' })).toBeInTheDocument()
  })

  it('lists future discoveries as clearly labeled, non-playable previews', async () => {
    renderJourney()
    await screen.findByRole('link', { name: 'Start Lesson' })

    const section = futureSection()
    expect(within(section).getAllByText('Future content')).toHaveLength(3)
    expect(within(section).getByRole('heading', { level: 3, name: 'Charge and Current' })).toBeInTheDocument()
    expect(within(section).getByRole('heading', { level: 3, name: 'Circuits to Build' })).toBeInTheDocument()
    expect(within(section).getByRole('heading', { level: 3, name: 'Electricity at Home' })).toBeInTheDocument()
    expect(within(section).getByText(/They are not playable yet/)).toBeInTheDocument()
  })

  it('keeps future previews free of links and buttons, and never implies they are unlocked', async () => {
    renderJourney()
    await screen.findByRole('link', { name: 'Start Lesson' })

    const section = futureSection()
    expect(within(section).queryAllByRole('link')).toHaveLength(0)
    expect(within(section).queryAllByRole('button')).toHaveLength(0)
    expect(screen.queryByText(/unlock/i)).not.toBeInTheDocument()
  })

  it('links only to the Electricity Mysteries lesson route', async () => {
    renderJourney()
    await screen.findByRole('link', { name: 'Start Lesson' })

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/journey/history-001')
  })

  it('opens the lesson route when the student chooses the lesson button', async () => {
    const user = userEvent.setup()
    renderJourney()

    await user.click(await screen.findByRole('link', { name: 'Start Lesson' }))

    expect(screen.getByText('Lesson route opened')).toBeInTheDocument()
  })
})
