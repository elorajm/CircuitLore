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

function path() {
  return screen.getByRole('list', { name: 'Your learning path' })
}

function lockedChapter(title) {
  return screen.getByRole('region', { name: title })
}

const LOCKED_CHAPTERS = [
  'Chapter 2: Charge and Current',
  'Chapter 3: Circuits to Build',
  'Chapter 4: Electricity at Home',
]

describe('LearningJourney lesson status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows a Completed badge, a Chapter complete tag, and a review link when the lesson is completed', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockResolvedValue(record('completed'))
    renderJourney()

    expect(await screen.findByText('Completed')).toBeInTheDocument()
    expect(getLessonProgressMock).toHaveBeenCalledWith('history-001')
    expect(screen.getByText('Chapter complete')).toBeInTheDocument()
    expect(screen.queryByText('You are here')).not.toBeInTheDocument()
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

    expect(await screen.findByRole('link', { name: 'Continue Lesson' })).toHaveAttribute(
      'href',
      '/journey/history-001',
    )
    expect(screen.getByText('In progress')).toBeInTheDocument()
    expect(screen.getByText('You are here')).toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })

  it('shows Not started and Start Lesson when the student has no progress row', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockResolvedValue(null)
    renderJourney()

    expect(await screen.findByRole('link', { name: 'Start Lesson' })).toHaveAttribute(
      'href',
      '/journey/history-001',
    )
    expect(screen.getByText('Not started')).toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    expect(screen.queryByText('In progress')).not.toBeInTheDocument()
  })

  it('shows Not started when the saved row is not_started', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockResolvedValue(record('not_started'))
    renderJourney()

    expect(await screen.findByRole('link', { name: 'Start Lesson' })).toBeInTheDocument()
    expect(screen.getByText('Not started')).toBeInTheDocument()
  })

  it('offers Start Lesson without checking progress for a signed-out visitor', async () => {
    useAuthMock.mockReturnValue(signedOut)
    renderJourney()

    expect(await screen.findByRole('link', { name: 'Start Lesson' })).toBeInTheDocument()
    expect(screen.getByText('Log in to save your progress as you go.')).toBeInTheDocument()
    expect(getLessonProgressMock).not.toHaveBeenCalled()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    expect(screen.queryByText('Not started')).not.toBeInTheDocument()
  })

  it('shows Start Lesson and a hint, never a badge, when progress cannot be loaded', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockRejectedValue(new Error('Failed to fetch lesson progress: boom'))
    renderJourney()

    expect(await screen.findByText(/We could not check your saved progress/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start Lesson' })).toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    expect(screen.queryByText('Not started')).not.toBeInTheDocument()
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

describe('LearningJourney adventure map', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthMock.mockReturnValue(signedOut)
  })

  it('opens with an adventure title and an introduction from early discoveries to modern technology', async () => {
    renderJourney()

    expect(screen.getByRole('heading', { level: 1, name: 'Your Electricity Adventure' })).toBeInTheDocument()
    expect(screen.getByText(/first electrical clues/)).toBeInTheDocument()
    expect(screen.getByText(/electrical technology that powers homes today/)).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Start Lesson' })).toBeInTheDocument()
  })

  it('lists four chapters in order on a single learning path', async () => {
    renderJourney()
    await screen.findByRole('link', { name: 'Start Lesson' })

    const items = Array.from(path().children)
    expect(items).toHaveLength(4)
    expect(items.every((item) => item.tagName === 'LI')).toBe(true)
    expect(within(items[0]).getByRole('heading', { level: 2 })).toHaveTextContent(
      'Chapter 1: The First Sparks',
    )
    expect(within(items[1]).getByRole('heading', { level: 2 })).toHaveTextContent(
      'Chapter 2: Charge and Current',
    )
    expect(within(items[2]).getByRole('heading', { level: 2 })).toHaveTextContent(
      'Chapter 3: Circuits to Build',
    )
    expect(within(items[3]).getByRole('heading', { level: 2 })).toHaveTextContent(
      'Chapter 4: Electricity at Home',
    )
  })

  it('shows Chapter 1 as the active chapter with the Electricity Mysteries lesson, activity, and quiz', async () => {
    renderJourney()

    expect(screen.getByText('You are here')).toBeInTheDocument()
    const card = lessonCard()
    expect(within(card).getByRole('heading', { level: 3, name: 'Electricity Mysteries' })).toBeInTheDocument()
    expect(within(card).getByText('Activity: Rub and Attract')).toBeInTheDocument()
    expect(within(card).getByText('Quiz: Knowledge Check')).toBeInTheDocument()
    expect(await within(card).findByRole('link', { name: 'Start Lesson' })).toBeInTheDocument()
  })

  it('shows the three upcoming chapters as locked Coming Soon previews', async () => {
    renderJourney()
    await screen.findByRole('link', { name: 'Start Lesson' })

    expect(screen.getAllByText('Coming Soon')).toHaveLength(3)
    LOCKED_CHAPTERS.forEach((title) => {
      const section = lockedChapter(title)
      expect(within(section).getByText('Coming Soon')).toBeInTheDocument()
    })
    expect(screen.getByText(/They are not playable yet/)).toBeInTheDocument()
  })

  it('keeps locked chapters free of links and buttons, and never implies they are unlocked', async () => {
    renderJourney()
    await screen.findByRole('link', { name: 'Start Lesson' })

    LOCKED_CHAPTERS.forEach((title) => {
      const section = lockedChapter(title)
      expect(within(section).queryAllByRole('link')).toHaveLength(0)
      expect(within(section).queryAllByRole('button')).toHaveLength(0)
    })
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

  it('does not repeat Dashboard summary cards or next-step sections', async () => {
    renderJourney()
    await screen.findByRole('link', { name: 'Start Lesson' })

    expect(screen.queryByText('Playable lessons')).not.toBeInTheDocument()
    expect(screen.queryByText('Lessons completed')).not.toBeInTheDocument()
    expect(screen.queryByText('Your Next Adventure')).not.toBeInTheDocument()
    expect(screen.queryByText('Your Progress')).not.toBeInTheDocument()
    expect(screen.queryByText(/what should i do next/i)).not.toBeInTheDocument()
  })
})
