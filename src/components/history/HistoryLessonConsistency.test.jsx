import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import HistoryTimeline from './HistoryTimeline.jsx'
import LearningJourney from '../../pages/LearningJourney.jsx'
import timelineMilestones from '../../content/history/timeline.js'

const { useAuthMock, getLessonProgressMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  getLessonProgressMock: vi.fn(),
}))

vi.mock('../../hooks/useAuth.js', () => ({
  useAuth: () => useAuthMock(),
}))

vi.mock('../../services/progressService.js', () => ({
  getLessonProgress: getLessonProgressMock,
}))

const signedIn = { user: { id: 'student-1' }, loading: false }
const signedOut = { user: null, loading: false }

function record(status) {
  return { lesson_id: 'history-001', status, attempts_count: 1, metadata: {} }
}

function renderBothPages() {
  return render(
    <MemoryRouter>
      <HistoryTimeline milestones={timelineMilestones} />
      <LearningJourney />
    </MemoryRouter>,
  )
}

const ERROR_HINT = /We could not check your saved progress/

beforeEach(() => {
  vi.clearAllMocks()
  useAuthMock.mockReturnValue(signedOut)
  getLessonProgressMock.mockResolvedValue(null)
})

describe('History and Learning Journey show the same lesson status', () => {
  it.each([
    {
      name: 'not started',
      progress: null,
      historyLink: 'Start lesson',
      journeyLink: 'Start Lesson',
      completed: false,
    },
    {
      name: 'in progress',
      progress: record('in_progress'),
      historyLink: 'Continue lesson',
      journeyLink: 'Continue Lesson',
      completed: false,
    },
    {
      name: 'completed',
      progress: record('completed'),
      historyLink: 'Review lesson',
      journeyLink: 'Review Lesson',
      completed: true,
    },
  ])(
    'for a signed-in student who is $name',
    async ({ progress, historyLink, journeyLink, completed }) => {
      useAuthMock.mockReturnValue(signedIn)
      getLessonProgressMock.mockResolvedValue(progress)
      renderBothPages()

      expect(await screen.findByRole('link', { name: historyLink })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: journeyLink })).toBeInTheDocument()
      expect(getLessonProgressMock).toHaveBeenCalledWith('history-001')

      expect(screen.queryByText(/Log in to/)).not.toBeInTheDocument()
      expect(screen.queryByText('Checking your progress...')).not.toBeInTheDocument()
      expect(screen.queryByText(ERROR_HINT)).not.toBeInTheDocument()

      if (completed) {
        expect(screen.getByText('Lesson completed!')).toBeInTheDocument()
        expect(screen.getByText('Completed')).toBeInTheDocument()
      } else {
        expect(screen.queryByText('Lesson completed!')).not.toBeInTheDocument()
        expect(screen.queryByText('Completed')).not.toBeInTheDocument()
      }
    },
  )

  it('shows a logged-out prompt on History and Start on the journey, without checking progress', async () => {
    useAuthMock.mockReturnValue(signedOut)
    renderBothPages()

    expect(await screen.findByRole('link', { name: 'Start lesson' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start Lesson' })).toBeInTheDocument()
    expect(screen.getByText(/Log in to start this lesson/)).toBeInTheDocument()
    expect(getLessonProgressMock).not.toHaveBeenCalled()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
  })

  it('shows the checking state on both pages while the session loads, with no lesson action', () => {
    useAuthMock.mockReturnValue({ user: null, loading: true })
    renderBothPages()

    expect(screen.getAllByRole('status')).toHaveLength(2)
    screen.getAllByText('Checking your progress...').forEach((node) => {
      expect(node).toBeInTheDocument()
    })
    expect(screen.queryByRole('link', { name: /Start|Continue|Review/ })).not.toBeInTheDocument()
    expect(screen.queryByText(/Log in to/)).not.toBeInTheDocument()
    expect(getLessonProgressMock).not.toHaveBeenCalled()
  })

  it('keeps both pages in the checking state while a signed-in student’s progress is pending', () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockReturnValue(new Promise(() => {}))
    renderBothPages()

    expect(screen.getAllByRole('status')).toHaveLength(2)
    expect(screen.queryByRole('link', { name: /Start|Continue|Review/ })).not.toBeInTheDocument()
    expect(screen.queryByText(/Log in to/)).not.toBeInTheDocument()
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    expect(screen.queryByText('Lesson completed!')).not.toBeInTheDocument()
  })

  it('shows the same error hint on both pages and never claims completion', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockRejectedValue(new Error('Failed to fetch lesson progress: boom'))
    renderBothPages()

    expect(await screen.findByRole('link', { name: 'Start lesson' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start Lesson' })).toBeInTheDocument()
    expect(screen.getAllByText(ERROR_HINT)).toHaveLength(2)
    expect(screen.queryByText('Completed')).not.toBeInTheDocument()
    expect(screen.queryByText('Lesson completed!')).not.toBeInTheDocument()
    expect(screen.queryByText(/Log in to/)).not.toBeInTheDocument()
  })
})
