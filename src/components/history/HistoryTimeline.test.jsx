import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import HistoryTimeline from './HistoryTimeline.jsx'
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

const signedOut = { user: null, loading: false }
const signedIn = { user: { id: 'student-1' }, loading: false }

function record(status) {
  return { lesson_id: 'history-001', status, attempts_count: 1, metadata: {} }
}

const total = timelineMilestones.length

beforeEach(() => {
  vi.clearAllMocks()
  useAuthMock.mockReturnValue(signedOut)
  getLessonProgressMock.mockResolvedValue(null)
})

function renderTimeline() {
  return render(
    <MemoryRouter>
      <HistoryTimeline milestones={timelineMilestones} />
    </MemoryRouter>,
  )
}

function getMilestone(id) {
  return timelineMilestones.find((milestone) => milestone.id === id)
}

function getMarkerButtons(container) {
  return Array.from(container.querySelectorAll('.timeline-marker-button'))
}

function getMarker(name) {
  return screen.getByRole('button', { name: new RegExp(name) })
}

function getNotesToggle() {
  return screen.getByRole('button', { name: 'Historian’s notes' })
}

describe('HistoryTimeline', () => {
  it('shows every milestone in chronological order with the first one selected', () => {
    const { container } = renderTimeline()

    const labels = getMarkerButtons(container).map((button) => button.textContent)
    expect(labels).toEqual(
      timelineMilestones.map((milestone) => `${milestone.displayDate}${milestone.shortName}`),
    )

    expect(getMarker('Thales and rubbed amber')).toHaveAttribute('aria-pressed', 'true')
    expect(getMarker('Gilbert names')).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByRole('heading', { level: 3, name: 'Thales and rubbed amber' }),
    ).toBeInTheDocument()
  })

  it('shows the selected milestone story and its closing hook when a marker is clicked', async () => {
    const user = userEvent.setup()
    renderTimeline()

    await user.click(getMarker('Testing lightning'))

    const franklin = getMilestone('franklin-lightning')
    expect(getMarker('Testing lightning')).toHaveAttribute('aria-pressed', 'true')
    expect(getMarker('Thales and rubbed amber')).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('heading', { level: 3, name: 'Testing lightning' })).toBeInTheDocument()
    expect(screen.getByText(franklin.story[0])).toBeInTheDocument()
    expect(screen.getByText(franklin.nextHook)).toBeInTheDocument()
  })

  it('selects a milestone with the Enter and Space keys', async () => {
    const user = userEvent.setup()
    renderTimeline()

    getMarker('Gilbert names').focus()
    await user.keyboard('{Enter}')
    expect(getMarker('Gilbert names')).toHaveAttribute('aria-pressed', 'true')

    getMarker('Volta').focus()
    await user.keyboard(' ')
    expect(getMarker('Volta')).toHaveAttribute('aria-pressed', 'true')
  })

  it('moves forward and back with Next and Previous', async () => {
    const user = userEvent.setup()
    renderTimeline()

    const previous = screen.getByRole('button', { name: 'Previous' })
    const next = screen.getByRole('button', { name: 'Next' })

    await user.click(next)
    expect(getMarker('The shocking fish')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(`Milestone 2 of ${total}`)).toBeInTheDocument()

    await user.click(previous)
    expect(getMarker('Thales and rubbed amber')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(`Milestone 1 of ${total}`)).toBeInTheDocument()
  })

  it('keeps Previous focusable but ignores it on the first milestone', async () => {
    const user = userEvent.setup()
    renderTimeline()

    const previous = screen.getByRole('button', { name: 'Previous' })
    expect(previous).toHaveAttribute('aria-disabled', 'true')
    expect(previous).not.toBeDisabled()

    await user.click(previous)
    expect(getMarker('Thales and rubbed amber')).toHaveAttribute('aria-pressed', 'true')
  })

  it('keeps Next focusable but ignores it on the last milestone', async () => {
    const user = userEvent.setup()
    renderTimeline()

    await user.click(getMarker('The integrated circuit'))

    const next = screen.getByRole('button', { name: 'Next' })
    expect(next).toHaveAttribute('aria-disabled', 'true')
    expect(next).not.toBeDisabled()

    await user.click(next)
    expect(getMarker('The integrated circuit')).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(`Milestone ${total} of ${total}`)).toBeInTheDocument()
  })

  it('links only the first milestone to the Electricity Mysteries lesson', async () => {
    const user = userEvent.setup()
    renderTimeline()

    const lessonLink = await screen.findByRole('link', { name: 'Start lesson' })
    expect(lessonLink).toHaveAttribute('href', '/journey/history-001')

    await user.click(getMarker('Gilbert names'))
    expect(screen.queryByRole('link', { name: /lesson/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Lesson coming soon' })).toBeDisabled()
  })

  it('gives every milestone a lesson control, disabled when its lesson is not built', async () => {
    const user = userEvent.setup()
    const { container } = renderTimeline()
    const markers = getMarkerButtons(container)

    for (let index = 0; index < total; index += 1) {
      await user.click(markers[index])

      if (timelineMilestones[index].lessonId) {
        expect(await screen.findByRole('link', { name: 'Start lesson' })).toBeInTheDocument()
      } else {
        expect(screen.getByRole('button', { name: 'Lesson coming soon' })).toBeDisabled()
        expect(screen.queryByRole('link', { name: /lesson/ })).not.toBeInTheDocument()
      }
    }
  })

  it('shows the time gap only for milestones that follow a long pause', async () => {
    const user = userEvent.setup()
    renderTimeline()

    expect(screen.queryByText(/years after the previous milestone/)).not.toBeInTheDocument()

    await user.click(getMarker('Gilbert names'))
    expect(screen.getByText('About 1,550 years after the previous milestone')).toBeInTheDocument()

    await user.click(getMarker('Testing lightning'))
    expect(screen.queryByText(/years after the previous milestone/)).not.toBeInTheDocument()
  })
})

describe('HistoryTimeline historian’s notes', () => {
  it('keeps the notes collapsed by default and hides citations until opened', () => {
    renderTimeline()

    const toggle = getNotesToggle()
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', 'timeline-notes-panel')
    expect(screen.queryByRole('link', { name: /Thales of Miletus/ })).not.toBeInTheDocument()
  })

  it('expands and collapses the notes with the button', async () => {
    const user = userEvent.setup()
    renderTimeline()

    const toggle = getNotesToggle()
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    const sourceLink = screen.getByRole('link', { name: /Thales of Miletus/ })
    expect(sourceLink).toHaveAttribute('href', 'https://en.wikipedia.org/wiki/Thales_of_Miletus')
    expect(sourceLink).toHaveAttribute('target', '_blank')
    expect(sourceLink).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.getByText(getMilestone('thales-amber').historianNote)).toBeInTheDocument()

    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: /Thales of Miletus/ })).not.toBeInTheDocument()
  })

  it('opens the notes from the keyboard', async () => {
    const user = userEvent.setup()
    renderTimeline()

    getNotesToggle().focus()
    await user.keyboard('{Enter}')
    expect(getNotesToggle()).toHaveAttribute('aria-expanded', 'true')

    await user.keyboard(' ')
    expect(getNotesToggle()).toHaveAttribute('aria-expanded', 'false')
  })

  it('collapses the notes when another milestone is selected', async () => {
    const user = userEvent.setup()
    renderTimeline()

    await user.click(getNotesToggle())
    expect(getNotesToggle()).toHaveAttribute('aria-expanded', 'true')

    await user.click(getMarker('Testing lightning'))
    expect(getNotesToggle()).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows the caveat for a disputed claim and keeps the Dalibard source in the notes', async () => {
    const user = userEvent.setup()
    renderTimeline()

    await user.click(getMarker('Testing lightning'))
    await user.click(getNotesToggle())

    expect(screen.getByText(getMilestone('franklin-lightning').historianNote)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Thomas-François Dalibard/ })).toBeInTheDocument()
  })
})

describe('HistoryTimeline lesson status', () => {
  it('invites a logged-out visitor to log in, with a Start link that still goes to the protected lesson', async () => {
    renderTimeline()

    const link = await screen.findByRole('link', { name: 'Start lesson' })
    expect(link).toHaveAttribute('href', '/journey/history-001')
    expect(link).toHaveAccessibleDescription('Log in to start this lesson and save your progress.')
    expect(getLessonProgressMock).not.toHaveBeenCalled()
  })

  it('shows a Start link and the autosave note for a signed-in student with no progress', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockResolvedValue(null)
    renderTimeline()

    const link = await screen.findByRole('link', { name: 'Start lesson' })
    expect(link).toHaveAccessibleDescription('Your progress is saved automatically.')
    expect(getLessonProgressMock).toHaveBeenCalledWith('history-001')
    expect(screen.queryByText(/Log in to/)).not.toBeInTheDocument()
  })

  it('offers Continue for a signed-in student whose lesson is in progress', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockResolvedValue(record('in_progress'))
    renderTimeline()

    const link = await screen.findByRole('link', { name: 'Continue lesson' })
    expect(link).toHaveAttribute('href', '/journey/history-001')
    expect(link).toHaveAccessibleDescription('Your progress is saved automatically.')
    expect(screen.queryByText(/Lesson completed!/)).not.toBeInTheDocument()
  })

  it('offers Review and confirms completion only when saved progress says completed', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockResolvedValue(record('completed'))
    renderTimeline()

    const link = await screen.findByRole('link', { name: 'Review lesson' })
    expect(link).toHaveAttribute('href', '/journey/history-001')
    expect(screen.getByText('Lesson completed!')).toBeInTheDocument()
    expect(screen.queryByText(/Log in to/)).not.toBeInTheDocument()
  })

  it('hides the lesson button and login text while the session is loading', () => {
    useAuthMock.mockReturnValue({ user: null, loading: true })
    renderTimeline()

    expect(screen.getByRole('status')).toHaveTextContent('Checking your progress...')
    expect(screen.queryByRole('link', { name: /lesson/ })).not.toBeInTheDocument()
    expect(screen.queryByText(/Log in to/)).not.toBeInTheDocument()
    expect(getLessonProgressMock).not.toHaveBeenCalled()
  })

  it('hides the lesson button and login text while saved progress is loading', () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockReturnValue(new Promise(() => {}))
    renderTimeline()

    expect(screen.getByRole('status')).toHaveTextContent('Checking your progress...')
    expect(screen.queryByRole('link', { name: /lesson/ })).not.toBeInTheDocument()
    expect(screen.queryByText(/Log in to/)).not.toBeInTheDocument()
    expect(screen.queryByText('Lesson completed!')).not.toBeInTheDocument()
  })

  it('never claims completion when saved progress cannot be loaded', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockRejectedValue(new Error('Failed to fetch lesson progress: boom'))
    renderTimeline()

    expect(await screen.findByText(/We could not check your saved progress/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Start lesson' })).toBeInTheDocument()
    expect(screen.queryByText('Lesson completed!')).not.toBeInTheDocument()
    expect(screen.queryByText(/Log in to/)).not.toBeInTheDocument()
  })
})
