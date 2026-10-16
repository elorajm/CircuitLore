import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProgressTestPage from './ProgressTestPage.jsx'

const { saveProgressMock, getLessonProgressMock, resetProgressMock } = vi.hoisted(() => ({
  saveProgressMock: vi.fn(),
  getLessonProgressMock: vi.fn(),
  resetProgressMock: vi.fn(),
}))

vi.mock('../services/progressService.js', () => ({
  saveProgress: saveProgressMock,
  getLessonProgress: getLessonProgressMock,
  resetProgress: resetProgressMock,
}))

vi.mock('../hooks/useAuth.js', () => ({
  useAuth: () => ({
    user: { id: 'adult-test-id', email: 'adult@example.com' },
    isAuthenticated: true,
    loading: false,
  }),
}))

const savedRecord = {
  student_id: 'adult-test-id',
  lesson_id: 'history-001',
  status: 'in_progress',
  attempts_count: 1,
  completed_at: null,
  last_accessed_at: '2026-10-15T10:00:00.000Z',
  metadata: { source: 'dev-test' },
}

const completedRecord = {
  ...savedRecord,
  status: 'completed',
  completed_at: '2026-10-15T11:00:00.000Z',
}

const restartedRecord = {
  ...completedRecord,
  status: 'not_started',
  completed_at: null,
  metadata: {},
  attempts_count: 2,
}

function valueFor(label) {
  return screen.getByText(label, { selector: 'dt' }).nextElementSibling.textContent
}

function button(name) {
  return screen.getByRole('button', { name })
}

describe('ProgressTestPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('makes no reads or writes on render', () => {
    render(<ProgressTestPage />)

    expect(saveProgressMock).not.toHaveBeenCalled()
    expect(getLessonProgressMock).not.toHaveBeenCalled()
    expect(resetProgressMock).not.toHaveBeenCalled()
  })

  it('shows the signed-in account and offers no delete control', () => {
    render(<ProgressTestPage />)

    expect(screen.getByText('adult@example.com')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /permanent/i })).not.toBeInTheDocument()
  })

  it('defaults to history-001', () => {
    render(<ProgressTestPage />)

    expect(screen.getByLabelText('Lesson')).toHaveValue('history-001')
  })

  it('starts history-001 only when Start lesson is clicked and shows the returned record', async () => {
    const user = userEvent.setup()
    saveProgressMock.mockResolvedValue(savedRecord)
    render(<ProgressTestPage />)

    await user.click(button('Start lesson (write)'))

    expect(saveProgressMock).toHaveBeenCalledTimes(1)
    expect(saveProgressMock).toHaveBeenCalledWith('history-001', 'in_progress')
    expect(await screen.findByRole('status')).toHaveTextContent('Lesson started')
    expect(valueFor('Status')).toBe('in_progress')
    expect(valueFor('attempts_count')).toBe('1')
    expect(valueFor('completed_at')).toBe('null')
  })

  it('saves with the metadata typed in the box', async () => {
    const user = userEvent.setup()
    saveProgressMock.mockResolvedValue(savedRecord)
    render(<ProgressTestPage />)

    await user.click(button('Save progress (write)'))

    expect(saveProgressMock).toHaveBeenCalledWith('history-001', 'in_progress', {
      source: 'dev-test',
    })
  })

  it('does not call the service when the metadata is not valid JSON', async () => {
    const user = userEvent.setup()
    render(<ProgressTestPage />)

    const metadata = screen.getByLabelText('Metadata for Save progress (JSON object)')
    await user.clear(metadata)
    await user.type(metadata, '{{not json')
    await user.click(button('Save progress (write)'))

    expect(saveProgressMock).not.toHaveBeenCalled()
    expect(await screen.findByRole('alert')).toHaveTextContent('Metadata must be valid JSON.')
  })

  it('rejects metadata that is a JSON array', async () => {
    const user = userEvent.setup()
    render(<ProgressTestPage />)

    const metadata = screen.getByLabelText('Metadata for Save progress (JSON object)')
    fireEvent.change(metadata, { target: { value: '[1,2]' } })
    await user.click(button('Save progress (write)'))

    expect(saveProgressMock).not.toHaveBeenCalled()
    expect(await screen.findByRole('alert')).toHaveTextContent('must be a JSON object')
  })

  it('marks the lesson completed and shows completed_at', async () => {
    const user = userEvent.setup()
    saveProgressMock.mockResolvedValue(completedRecord)
    render(<ProgressTestPage />)

    await user.click(button('Mark completed (write)'))

    expect(saveProgressMock).toHaveBeenCalledWith('history-001', 'completed')
    expect(await screen.findByRole('status')).toHaveTextContent('Lesson marked completed')
    expect(valueFor('Status')).toBe('completed')
    expect(valueFor('completed_at')).toBe('2026-10-15T11:00:00.000Z')
  })

  it('retrieves saved progress with a read only', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue(savedRecord)
    render(<ProgressTestPage />)

    await user.click(button('Retrieve saved progress (read)'))

    expect(getLessonProgressMock).toHaveBeenCalledWith('history-001')
    expect(saveProgressMock).not.toHaveBeenCalled()
    expect(resetProgressMock).not.toHaveBeenCalled()
    expect(await screen.findByRole('status')).toHaveTextContent('Loaded the saved progress')
    expect(valueFor('metadata')).toBe('{"source":"dev-test"}')
  })

  it('reports when no row exists for the lesson', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue(null)
    render(<ProgressTestPage />)

    await user.click(button('Retrieve saved progress (read)'))

    expect(await screen.findByRole('status')).toHaveTextContent('No progress row exists')
    expect(screen.queryByText('attempts_count', { selector: 'dt' })).not.toBeInTheDocument()
  })

  it('restarts the lesson, then reloads the record to show attempts_count is kept', async () => {
    const user = userEvent.setup()
    resetProgressMock.mockResolvedValue({ success: true })
    getLessonProgressMock.mockResolvedValue(restartedRecord)
    render(<ProgressTestPage />)

    await user.click(button('Restart lesson (write)'))

    expect(resetProgressMock).toHaveBeenCalledWith('history-001')
    expect(getLessonProgressMock).toHaveBeenCalledWith('history-001')
    expect(await screen.findByRole('status')).toHaveTextContent('attempts_count was kept')
    expect(valueFor('Status')).toBe('not_started')
    expect(valueFor('attempts_count')).toBe('2')
    expect(valueFor('completed_at')).toBe('null')
  })

  it('explains when a restart finds no row', async () => {
    const user = userEvent.setup()
    resetProgressMock.mockResolvedValue({ success: true })
    getLessonProgressMock.mockResolvedValue(null)
    render(<ProgressTestPage />)

    await user.click(button('Restart lesson (write)'))

    expect(await screen.findByRole('status')).toHaveTextContent('nothing changed')
  })

  it('shows service errors in an alert', async () => {
    const user = userEvent.setup()
    saveProgressMock.mockRejectedValue(new Error('Failed to save progress: permission denied'))
    render(<ProgressTestPage />)

    await user.click(button('Start lesson (write)'))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to save progress: permission denied',
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('sends the selected lesson id to the service', async () => {
    const user = userEvent.setup()
    saveProgressMock.mockResolvedValue({ ...savedRecord, lesson_id: 'history-002' })
    render(<ProgressTestPage />)

    await user.selectOptions(screen.getByLabelText('Lesson'), 'history-002')
    await user.click(button('Start lesson (write)'))

    expect(saveProgressMock).toHaveBeenCalledWith('history-002', 'in_progress')
  })

  it('disables every action while a request is pending', async () => {
    const user = userEvent.setup()
    saveProgressMock.mockReturnValue(new Promise(() => {}))
    render(<ProgressTestPage />)

    await user.click(button('Start lesson (write)'))

    const actions = within(document.querySelector('.dev-progress-test-actions'))
    for (const name of [
      'Start lesson (write)',
      'Save progress (write)',
      'Mark completed (write)',
      'Retrieve saved progress (read)',
      'Restart lesson (write)',
    ]) {
      expect(actions.getByRole('button', { name })).toBeDisabled()
    }
  })
})
