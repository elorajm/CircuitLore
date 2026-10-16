import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import LessonPage from './LessonPage.jsx'

const { saveProgressMock, getLessonProgressMock } = vi.hoisted(() => ({
  saveProgressMock: vi.fn(),
  getLessonProgressMock: vi.fn(),
}))

vi.mock('../services/progressService.js', () => ({
  saveProgress: saveProgressMock,
  getLessonProgress: getLessonProgressMock,
}))

function record(status, metadata, extra = {}) {
  return {
    lesson_id: 'history-001',
    status,
    attempts_count: 1,
    completed_at: status === 'completed' ? '2026-10-15T11:00:00.000Z' : null,
    metadata,
    ...extra,
  }
}

function renderLesson(path = '/journey/history-001') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/journey/:lessonId" element={<LessonPage />} />
        <Route path="/journey" element={<p>Journey page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LessonPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows not found for an unknown lesson without touching progress', () => {
    renderLesson('/journey/not-a-lesson')

    expect(screen.getByRole('heading', { level: 1, name: 'Lesson not found' })).toBeInTheDocument()
    expect(getLessonProgressMock).not.toHaveBeenCalled()
    expect(saveProgressMock).not.toHaveBeenCalled()
  })

  it('loads progress on mount and writes nothing until Begin is clicked', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue(null)
    saveProgressMock.mockResolvedValue(record('in_progress', { step: 1, quizScore: null, activityDone: false }))
    renderLesson()

    const begin = await screen.findByRole('button', { name: 'Begin' })
    expect(getLessonProgressMock).toHaveBeenCalledWith('history-001')
    expect(saveProgressMock).not.toHaveBeenCalled()

    await user.click(begin)

    expect(saveProgressMock).toHaveBeenCalledTimes(1)
    expect(saveProgressMock).toHaveBeenCalledWith('history-001', 'in_progress', {
      step: 1,
      quizScore: null,
      activityDone: false,
    })
    expect(await screen.findByText('Step 2 of 6: Thales and amber')).toBeInTheDocument()
  })

  it('stays on the same step when a save fails and saves again on retry', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue(null)
    saveProgressMock
      .mockRejectedValueOnce(new Error('Failed to save progress: offline'))
      .mockResolvedValueOnce(record('in_progress', { step: 1, quizScore: null, activityDone: false }))
    renderLesson()

    await user.click(await screen.findByRole('button', { name: 'Begin' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Your progress could not be saved')
    expect(screen.getByText('Step 1 of 6: Welcome')).toBeInTheDocument()

    await user.click(within(alert).getByRole('button', { name: 'Try saving again' }))

    expect(saveProgressMock).toHaveBeenCalledTimes(2)
    expect(await screen.findByText('Step 2 of 6: Thales and amber')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('keeps Next disabled on the activity until the rod pulls the paper, then saves activityDone', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue(record('in_progress', { step: 3, quizScore: null, activityDone: false }))
    saveProgressMock.mockResolvedValue(record('in_progress', { step: 4, quizScore: null, activityDone: true }))
    renderLesson()

    expect(await screen.findByRole('heading', { level: 2, name: 'Rub and Attract' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()

    for (let count = 0; count < 3; count += 1) {
      await user.click(screen.getByRole('button', { name: 'Rub the rod' }))
    }
    await user.click(screen.getByRole('button', { name: 'Hold rod near the paper' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(saveProgressMock).toHaveBeenCalledWith('history-001', 'in_progress', {
      step: 4,
      quizScore: null,
      activityDone: true,
    })
    expect(await screen.findByText('Step 5 of 6: Today')).toBeInTheDocument()
  })

  it('saves the quiz score on submit and marks the lesson completed only on Finish Lesson', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue(record('in_progress', { step: 5, quizScore: null, activityDone: true }))
    saveProgressMock
      .mockResolvedValueOnce(record('in_progress', { step: 5, quizScore: 3, activityDone: true }))
      .mockResolvedValueOnce(record('completed', { step: 5, quizScore: 3, activityDone: true }))
    renderLesson()

    expect(await screen.findByRole('button', { name: 'Finish Lesson' })).toBeDisabled()

    await user.click(screen.getByRole('radio', { name: 'Electricity' }))
    await user.click(
      screen.getByRole('radio', { name: 'It moved tiny charged particles (electrons) onto the balloon' }),
    )
    await user.click(
      screen.getByRole('radio', {
        name: 'The charges inside the paper shift, so the side nearest the rod becomes the opposite charge and is pulled in',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Check answers' }))

    expect(saveProgressMock).toHaveBeenNthCalledWith(1, 'history-001', 'in_progress', {
      step: 5,
      quizScore: 3,
      activityDone: true,
    })
    expect(saveProgressMock).toHaveBeenCalledTimes(1)

    await user.click(await screen.findByRole('button', { name: 'Finish Lesson' }))

    expect(saveProgressMock).toHaveBeenNthCalledWith(2, 'history-001', 'completed', {
      step: 5,
      quizScore: 3,
      activityDone: true,
    })
    expect(await screen.findByRole('heading', { level: 2, name: 'Congratulations!' })).toBeInTheDocument()
    expect(screen.getByText('You completed Electricity Mysteries!')).toBeInTheDocument()
    expect(screen.getByText('3 out of 3 correct')).toBeInTheDocument()
    expect(screen.getByText('Your progress has been saved.')).toBeInTheDocument()
    expect(screen.queryByText(/Review mode/)).not.toBeInTheDocument()
  })

  it('answering the quiz alone saves in progress and never shows the completion screen', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue(record('in_progress', { step: 5, quizScore: null, activityDone: true }))
    saveProgressMock.mockResolvedValue(record('in_progress', { step: 5, quizScore: 3, activityDone: true }))
    renderLesson()

    await user.click(await screen.findByRole('radio', { name: 'Electricity' }))
    await user.click(
      screen.getByRole('radio', { name: 'It moved tiny charged particles (electrons) onto the balloon' }),
    )
    await user.click(
      screen.getByRole('radio', {
        name: 'The charges inside the paper shift, so the side nearest the rod becomes the opposite charge and is pulled in',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Check answers' }))

    expect(await screen.findByText('You got 3 out of 3 correct.')).toBeInTheDocument()
    expect(saveProgressMock).toHaveBeenCalledTimes(1)
    expect(saveProgressMock).not.toHaveBeenCalledWith('history-001', 'completed', expect.anything())
    expect(screen.queryByText('Congratulations!')).not.toBeInTheDocument()
  })

  it('keeps quiz answers and the step when Finish fails, then shows completion after a successful retry', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue(record('in_progress', { step: 5, quizScore: null, activityDone: true }))
    saveProgressMock
      .mockResolvedValueOnce(record('in_progress', { step: 5, quizScore: 3, activityDone: true }))
      .mockRejectedValueOnce(new Error('Failed to save progress: offline'))
      .mockResolvedValueOnce(record('completed', { step: 5, quizScore: 3, activityDone: true }))
    renderLesson()

    await user.click(await screen.findByRole('radio', { name: 'Electricity' }))
    await user.click(
      screen.getByRole('radio', { name: 'It moved tiny charged particles (electrons) onto the balloon' }),
    )
    await user.click(
      screen.getByRole('radio', {
        name: 'The charges inside the paper shift, so the side nearest the rod becomes the opposite charge and is pulled in',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Check answers' }))
    await user.click(await screen.findByRole('button', { name: 'Finish Lesson' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Your progress could not be saved')
    expect(alert).toHaveTextContent('Your quiz answers are kept')
    expect(screen.queryByText('Congratulations!')).not.toBeInTheDocument()
    expect(screen.getByText('Step 6 of 6: Knowledge check')).toBeInTheDocument()
    expect(screen.getByText('You got 3 out of 3 correct.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()

    await user.click(within(alert).getByRole('button', { name: 'Try saving again' }))

    expect(saveProgressMock).toHaveBeenCalledTimes(3)
    expect(saveProgressMock).toHaveBeenNthCalledWith(3, 'history-001', 'completed', {
      step: 5,
      quizScore: 3,
      activityDone: true,
    })
    expect(await screen.findByRole('heading', { level: 2, name: 'Congratulations!' })).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('opens a completed lesson on the completion screen at its last step without any writes', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue(record('completed', { step: 5, quizScore: 3, activityDone: true }))
    renderLesson()

    expect(await screen.findByText(/Review mode/)).toBeInTheDocument()
    for (let count = 0; count < 5; count += 1) {
      await user.click(screen.getByRole('button', { name: 'Next' }))
    }

    expect(await screen.findByRole('heading', { level: 2, name: 'Congratulations!' })).toBeInTheDocument()
    expect(screen.getByText('3 out of 3 correct')).toBeInTheDocument()
    expect(screen.queryByText(/Review mode/)).not.toBeInTheDocument()
    expect(saveProgressMock).not.toHaveBeenCalled()
  })

  it('opens a completed lesson in review mode with no writes and no restart', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue(record('completed', { step: 5, quizScore: 3, activityDone: true }))
    renderLesson()

    expect(await screen.findByText(/Review mode/)).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 6: Welcome')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Begin' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(screen.getByText('Step 2 of 6: Thales and amber')).toBeInTheDocument()
    expect(saveProgressMock).not.toHaveBeenCalled()
  })

  it('offers a retry instead of guessing a location when progress cannot be loaded', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockRejectedValueOnce(new Error('Failed to fetch lesson progress: boom'))
    getLessonProgressMock.mockResolvedValueOnce(null)
    renderLesson()

    expect(await screen.findByRole('alert')).toHaveTextContent('We could not load your progress')
    expect(saveProgressMock).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('button', { name: 'Begin' })).toBeInTheDocument()
    expect(getLessonProgressMock).toHaveBeenCalledTimes(2)
  })
})
