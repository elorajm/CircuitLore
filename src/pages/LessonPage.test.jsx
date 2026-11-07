import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import LessonPage from './LessonPage.jsx'

const {
  saveProgressMock,
  getLessonProgressMock,
  resetProgressMock,
  permanentlyDeleteAllProgressMock,
} = vi.hoisted(() => ({
  saveProgressMock: vi.fn(),
  getLessonProgressMock: vi.fn(),
  resetProgressMock: vi.fn(),
  permanentlyDeleteAllProgressMock: vi.fn(),
}))

vi.mock('../services/progressService.js', () => ({
  saveProgress: saveProgressMock,
  getLessonProgress: getLessonProgressMock,
  resetProgress: resetProgressMock,
  permanentlyDeleteAllProgress: permanentlyDeleteAllProgressMock,
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

  describe('reset lesson progress', () => {
    const RESET_LABEL = 'Reset Lesson Progress'
    const inProgressRecord = record('in_progress', { step: 1, quizScore: null, activityDone: false })
    const completedRecord = record('completed', { step: 5, quizScore: 3, activityDone: true })
    const notStartedRecord = record('not_started', {})

    let confirmSpy

    beforeEach(() => {
      resetProgressMock.mockReset()
      saveProgressMock.mockReset()
      getLessonProgressMock.mockReset()
      confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    })

    afterEach(() => {
      confirmSpy.mockRestore()
    })

    it.each([
      ['in progress', inProgressRecord],
      ['completed', completedRecord],
    ])('shows the reset button when the lesson is %s', async (_label, savedRecord) => {
      getLessonProgressMock.mockResolvedValue(savedRecord)
      renderLesson()

      expect(await screen.findByRole('button', { name: RESET_LABEL })).toBeInTheDocument()
    })

    it.each([
      ['has no saved row', null],
      ['was reset to not started', notStartedRecord],
    ])('hides the reset button when the lesson %s', async (_label, savedRecord) => {
      getLessonProgressMock.mockResolvedValue(savedRecord)
      renderLesson()

      expect(await screen.findByRole('button', { name: 'Begin' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: RESET_LABEL })).not.toBeInTheDocument()
    })

    it('does nothing when the confirmation is canceled', async () => {
      const user = userEvent.setup()
      confirmSpy.mockReturnValue(false)
      getLessonProgressMock.mockResolvedValue(inProgressRecord)
      renderLesson()

      await user.click(await screen.findByRole('button', { name: RESET_LABEL }))

      expect(confirmSpy).toHaveBeenCalledTimes(1)
      expect(resetProgressMock).not.toHaveBeenCalled()
      expect(getLessonProgressMock).toHaveBeenCalledTimes(1)
      expect(screen.getByText('Step 2 of 6: Thales and amber')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: RESET_LABEL })).toBeEnabled()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('resets only the lesson on this page and never deletes the student account', async () => {
      const user = userEvent.setup()
      getLessonProgressMock
        .mockResolvedValueOnce(inProgressRecord)
        .mockResolvedValue(notStartedRecord)
      resetProgressMock.mockResolvedValue({ success: true, message: 'Progress reset for lesson history-001' })
      renderLesson()

      await user.click(await screen.findByRole('button', { name: RESET_LABEL }))

      expect(confirmSpy).toHaveBeenCalledTimes(1)
      expect(resetProgressMock).toHaveBeenCalledTimes(1)
      expect(resetProgressMock).toHaveBeenCalledWith('history-001')
      expect(permanentlyDeleteAllProgressMock).not.toHaveBeenCalled()
      expect(saveProgressMock).not.toHaveBeenCalled()
      expect(await screen.findByRole('button', { name: 'Begin' })).toBeInTheDocument()
    })

    it('returns the lesson to Not Started at Step 1 after a successful reset', async () => {
      const user = userEvent.setup()
      getLessonProgressMock
        .mockResolvedValueOnce(inProgressRecord)
        .mockResolvedValue(notStartedRecord)
      resetProgressMock.mockResolvedValue({ success: true, message: 'Progress reset for lesson history-001' })
      renderLesson()

      await user.click(await screen.findByRole('button', { name: RESET_LABEL }))

      expect(await screen.findByRole('button', { name: 'Begin' })).toBeInTheDocument()
      expect(screen.getByText('Step 1 of 6: Welcome')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: RESET_LABEL })).not.toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      // Initial load, verification read, and the reload after the reset.
      expect(getLessonProgressMock).toHaveBeenCalledTimes(3)
    })

    it.each([
      [
        'the reset request fails',
        () => {
          resetProgressMock.mockRejectedValue(new Error('Failed to reset progress: offline'))
          getLessonProgressMock.mockResolvedValue(inProgressRecord)
        },
      ],
      [
        'the database still reports the lesson as in progress',
        () => {
          resetProgressMock.mockResolvedValue({ success: true })
          getLessonProgressMock.mockResolvedValue(inProgressRecord)
        },
      ],
      [
        'the verification read fails',
        () => {
          resetProgressMock.mockResolvedValue({ success: true })
          getLessonProgressMock
            .mockResolvedValueOnce(inProgressRecord)
            .mockRejectedValueOnce(new Error('Failed to fetch lesson progress: boom'))
        },
      ],
    ])('shows a helpful error and keeps the student in place when %s', async (_label, setup) => {
      const user = userEvent.setup()
      setup()
      renderLesson()

      await user.click(await screen.findByRole('button', { name: RESET_LABEL }))

      expect(await screen.findByRole('alert')).toHaveTextContent(
        'We could not reset your lesson progress. Please try again.',
      )
      expect(screen.getByText('Step 2 of 6: Thales and amber')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: RESET_LABEL })).toBeEnabled()
    })

    it('ignores repeated clicks while a reset is running', async () => {
      const user = userEvent.setup()
      let finishReset
      resetProgressMock.mockReturnValue(
        new Promise((resolve) => {
          finishReset = resolve
        }),
      )
      getLessonProgressMock
        .mockResolvedValueOnce(inProgressRecord)
        .mockResolvedValue(notStartedRecord)
      renderLesson()

      await user.click(await screen.findByRole('button', { name: RESET_LABEL }))
      const resetting = await screen.findByRole('button', { name: 'Resetting...' })
      expect(resetting).toBeDisabled()
      await user.click(resetting)

      expect(confirmSpy).toHaveBeenCalledTimes(1)
      expect(resetProgressMock).toHaveBeenCalledTimes(1)

      await act(async () => finishReset({ success: true }))

      expect(await screen.findByRole('button', { name: 'Begin' })).toBeInTheDocument()
    })

    it('disables the reset button while a progress save is in progress', async () => {
      const user = userEvent.setup()
      let finishSave
      saveProgressMock.mockReturnValue(
        new Promise((resolve) => {
          finishSave = resolve
        }),
      )
      getLessonProgressMock.mockResolvedValue(inProgressRecord)
      renderLesson()

      await user.click(await screen.findByRole('button', { name: 'Next' }))

      const resetButton = screen.getByRole('button', { name: RESET_LABEL })
      expect(resetButton).toBeDisabled()
      await user.click(resetButton)
      expect(confirmSpy).not.toHaveBeenCalled()
      expect(resetProgressMock).not.toHaveBeenCalled()

      await act(async () => finishSave(record('in_progress', { step: 2, quizScore: null, activityDone: false })))

      expect(await screen.findByRole('button', { name: RESET_LABEL })).toBeEnabled()
    })

    it('does not let a lesson save start while a reset is running', async () => {
      const user = userEvent.setup()
      let finishReset
      resetProgressMock.mockReturnValue(
        new Promise((resolve) => {
          finishReset = resolve
        }),
      )
      getLessonProgressMock
        .mockResolvedValueOnce(inProgressRecord)
        .mockResolvedValue(notStartedRecord)
      renderLesson()

      await user.click(await screen.findByRole('button', { name: RESET_LABEL }))
      await user.click(screen.getByRole('button', { name: 'Next' }))

      expect(saveProgressMock).not.toHaveBeenCalled()

      await act(async () => finishReset({ success: true }))

      expect(await screen.findByRole('button', { name: 'Begin' })).toBeInTheDocument()
      expect(saveProgressMock).not.toHaveBeenCalled()
    })
  })
})

describe('Electric Charge lesson (concept-001) progress', () => {
  const CONCEPT_ID = 'concept-001'
  const STATIC_LABEL = 'Static electricity'
  const CURRENT_LABEL = 'Electric current'

  function conceptRecord(status, metadata, extra = {}) {
    return { lesson_id: CONCEPT_ID, status, attempts_count: 1, completed_at: null, metadata, ...extra }
  }

  // Example fieldsets are named by their numbered legends, so the history panel's details group is skipped
  function exampleGroups() {
    return screen.getAllByRole('group', { name: /^\d\. / })
  }

  beforeEach(() => {
    resetProgressMock.mockReset()
    saveProgressMock.mockReset()
    getLessonProgressMock.mockReset()
  })

  it('starts at Step 1 and saves progress under concept-001 when Begin is clicked', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue(null)
    saveProgressMock.mockResolvedValue(conceptRecord('in_progress', { step: 1, quizScore: null, activityDone: false }))
    renderLesson('/journey/concept-001')

    await user.click(await screen.findByRole('button', { name: 'Begin' }))

    expect(getLessonProgressMock).toHaveBeenCalledWith(CONCEPT_ID)
    expect(saveProgressMock).toHaveBeenCalledWith(CONCEPT_ID, 'in_progress', {
      step: 1,
      quizScore: null,
      activityDone: false,
    })
    expect(await screen.findByText('Step 2 of 7: Moving electrons')).toBeInTheDocument()
  })

  it('restores the saved step for a student returning to Electric Charge', async () => {
    getLessonProgressMock.mockResolvedValue(
      conceptRecord('in_progress', { step: 3, quizScore: null, activityDone: false }),
    )
    renderLesson('/journey/concept-001')

    expect(await screen.findByText('Step 4 of 7: Current')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Electric Charge' })).toBeInTheDocument()
  })

  it('saves activityDone only after all four examples are sorted, then allows Next', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue(
      conceptRecord('in_progress', { step: 4, quizScore: null, activityDone: false }),
    )
    saveProgressMock.mockResolvedValue(conceptRecord('in_progress', { step: 5, quizScore: null, activityDone: true }))
    renderLesson('/journey/concept-001')

    expect(await screen.findByRole('heading', { level: 2, name: 'Static or Current?' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()

    const answers = [STATIC_LABEL, CURRENT_LABEL, STATIC_LABEL, CURRENT_LABEL]
    for (const [index, label] of answers.entries()) {
      await user.click(within(exampleGroups()[index]).getByRole('radio', { name: label }))
    }
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(saveProgressMock).toHaveBeenCalledWith(CONCEPT_ID, 'in_progress', {
      step: 5,
      quizScore: null,
      activityDone: true,
    })
    expect(await screen.findByText('Step 6 of 7: Today')).toBeInTheDocument()
  })

  it('marks the lesson completed with the quiz score only on Finish Lesson', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue(
      conceptRecord('in_progress', { step: 6, quizScore: null, activityDone: true }),
    )
    saveProgressMock
      .mockResolvedValueOnce(conceptRecord('in_progress', { step: 6, quizScore: 3, activityDone: true }))
      .mockResolvedValueOnce(conceptRecord('completed', { step: 6, quizScore: 3, activityDone: true }))
    renderLesson('/journey/concept-001')

    await user.click(await screen.findByRole('radio', { name: 'Electron' }))
    await user.click(screen.getByRole('radio', { name: 'They repel and push apart' }))
    await user.click(
      screen.getByRole('radio', {
        name: 'Static electricity is charge that builds up and stays in place. Current is charge that keeps moving through a complete path.',
      }),
    )
    await user.click(screen.getByRole('button', { name: 'Check answers' }))
    await user.click(await screen.findByRole('button', { name: 'Finish Lesson' }))

    expect(saveProgressMock).toHaveBeenNthCalledWith(2, CONCEPT_ID, 'completed', {
      step: 6,
      quizScore: 3,
      activityDone: true,
    })
    expect(await screen.findByRole('heading', { level: 2, name: 'Congratulations!' })).toBeInTheDocument()
    expect(screen.getByText('You completed Electric Charge!')).toBeInTheDocument()
    expect(screen.getByText('3 out of 3 correct')).toBeInTheDocument()
  })

  it('resets Electric Charge using its own lesson id', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    getLessonProgressMock
      .mockResolvedValueOnce(conceptRecord('completed', { step: 6, quizScore: 3, activityDone: true }))
      .mockResolvedValue(conceptRecord('not_started', {}))
    resetProgressMock.mockResolvedValue({ success: true })
    renderLesson('/journey/concept-001')

    await user.click(await screen.findByRole('button', { name: 'Reset Lesson Progress' }))

    expect(resetProgressMock).toHaveBeenCalledWith(CONCEPT_ID)
    expect(await screen.findByRole('button', { name: 'Begin' })).toBeInTheDocument()
    confirmSpy.mockRestore()
  })
})

describe('Electric Current lesson (concept-002) progress', () => {
  const CURRENT_ID = 'concept-002'

  function currentRecord(status, metadata, extra = {}) {
    return { lesson_id: CURRENT_ID, status, attempts_count: 1, completed_at: null, metadata, ...extra }
  }

  function gapGroup(name) {
    return screen.getByRole('group', { name })
  }

  beforeEach(() => {
    resetProgressMock.mockReset()
    saveProgressMock.mockReset()
    getLessonProgressMock.mockReset()
  })

  it('starts at Step 1 and saves progress under concept-002 when Begin is clicked', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue(null)
    saveProgressMock.mockResolvedValue(currentRecord('in_progress', { step: 1, quizScore: null, activityDone: false }))
    renderLesson('/journey/concept-002')

    await user.click(await screen.findByRole('button', { name: 'Begin' }))

    expect(getLessonProgressMock).toHaveBeenCalledWith(CURRENT_ID)
    expect(saveProgressMock).toHaveBeenCalledWith(CURRENT_ID, 'in_progress', {
      step: 1,
      quizScore: null,
      activityDone: false,
    })
    expect(await screen.findByText('Step 2 of 6: Parts')).toBeInTheDocument()
  })

  it('restores the saved step for a student returning to Electric Current', async () => {
    getLessonProgressMock.mockResolvedValue(
      currentRecord('in_progress', { step: 2, quizScore: null, activityDone: false }),
    )
    renderLesson('/journey/concept-002')

    expect(await screen.findByText('Step 3 of 6: Complete path')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Electric Current' })).toBeInTheDocument()
  })

  it('saves activityDone only after the bulb is lit and then broken, then allows Next', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue(
      currentRecord('in_progress', { step: 3, quizScore: null, activityDone: false }),
    )
    saveProgressMock.mockResolvedValue(currentRecord('in_progress', { step: 4, quizScore: null, activityDone: true }))
    renderLesson('/journey/concept-002')

    expect(await screen.findByRole('heading', { level: 2, name: 'Build the Loop' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()

    await user.click(within(gapGroup('Top wire')).getByRole('radio', { name: 'Copper wire' }))
    await user.click(within(gapGroup('Bottom wire')).getByRole('radio', { name: 'Copper wire' }))
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()

    await user.click(within(gapGroup('Bottom wire')).getByRole('radio', { name: 'Leave a gap' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))

    expect(saveProgressMock).toHaveBeenCalledWith(CURRENT_ID, 'in_progress', {
      step: 4,
      quizScore: null,
      activityDone: true,
    })
    expect(await screen.findByText('Step 5 of 6: Today')).toBeInTheDocument()
  })

  it('marks the lesson completed with the quiz score only on Finish Lesson', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue(
      currentRecord('in_progress', { step: 5, quizScore: null, activityDone: true }),
    )
    saveProgressMock
      .mockResolvedValueOnce(currentRecord('in_progress', { step: 5, quizScore: 3, activityDone: true }))
      .mockResolvedValueOnce(currentRecord('completed', { step: 5, quizScore: 3, activityDone: true }))
    renderLesson('/journey/concept-002')

    await user.click(await screen.findByRole('radio', { name: 'The flow of electric charge through a complete path' }))
    await user.click(
      screen.getByRole('radio', {
        name: 'Plastic is an insulator, so it blocks the flow of charge and the loop is broken',
      }),
    )
    await user.click(screen.getByRole('radio', { name: 'The light bulb (electrical load)' }))
    await user.click(screen.getByRole('button', { name: 'Check answers' }))
    await user.click(await screen.findByRole('button', { name: 'Finish Lesson' }))

    expect(saveProgressMock).toHaveBeenNthCalledWith(2, CURRENT_ID, 'completed', {
      step: 5,
      quizScore: 3,
      activityDone: true,
    })
    expect(await screen.findByRole('heading', { level: 2, name: 'Congratulations!' })).toBeInTheDocument()
    expect(screen.getByText('You completed Electric Current!')).toBeInTheDocument()
    expect(screen.getByText('3 out of 3 correct')).toBeInTheDocument()
  })

  it('resets Electric Current using its own lesson id', async () => {
    const user = userEvent.setup()
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
    getLessonProgressMock
      .mockResolvedValueOnce(currentRecord('completed', { step: 5, quizScore: 3, activityDone: true }))
      .mockResolvedValue(currentRecord('not_started', {}))
    resetProgressMock.mockResolvedValue({ success: true })
    renderLesson('/journey/concept-002')

    await user.click(await screen.findByRole('button', { name: 'Reset Lesson Progress' }))

    expect(resetProgressMock).toHaveBeenCalledWith(CURRENT_ID)
    expect(await screen.findByRole('button', { name: 'Begin' })).toBeInTheDocument()
    confirmSpy.mockRestore()
  })
})

describe('lesson pages connect to the historical timeline', () => {
  beforeEach(() => {
    getLessonProgressMock.mockReset()
  })

  it('shows the discoveries behind Electric Charge above the lesson, with a way back to the timeline', async () => {
    getLessonProgressMock.mockResolvedValue(null)
    renderLesson('/journey/concept-001')

    const panel = screen.getByRole('complementary', { name: 'Where these ideas came from' })
    expect(within(panel).getByRole('link', { name: /Two kinds of electricity/ })).toHaveAttribute(
      'href',
      '/history#du-fay-two-kinds',
    )
    expect(within(panel).getByRole('link', { name: 'Back to the timeline' })).toHaveAttribute('href', '/history')
    expect(await screen.findByRole('button', { name: 'Begin' })).toBeInTheDocument()
  })
})

describe('lesson page flow between steps', () => {
  beforeEach(() => {
    getLessonProgressMock.mockReset()
  })

  it('introduces the activity as Quill’s challenge and the quiz as a quick check', async () => {
    getLessonProgressMock.mockResolvedValue({
      lesson_id: 'concept-001',
      status: 'in_progress',
      attempts_count: 1,
      completed_at: null,
      metadata: { step: 4, quizScore: null, activityDone: false },
    })
    renderLesson('/journey/concept-001')

    expect(await screen.findByText('Quill’s challenge')).toBeInTheDocument()
    expect(screen.getByText(/Read each example/)).toBeInTheDocument()
  })

  it('leads a completed Electricity Mysteries review into Electric Charge', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue({
      lesson_id: 'history-001',
      status: 'completed',
      attempts_count: 1,
      completed_at: '2026-10-15T11:00:00.000Z',
      metadata: { step: 5, quizScore: 3, activityDone: true },
    })
    renderLesson('/journey/history-001')

    expect(await screen.findByText(/Review mode/)).toBeInTheDocument()
    for (let count = 0; count < 5; count += 1) {
      await user.click(screen.getByRole('button', { name: 'Next' }))
    }

    expect(await screen.findByRole('link', { name: 'Continue to Electric Charge' })).toHaveAttribute(
      'href',
      '/journey/concept-001',
    )
    expect(saveProgressMock).not.toHaveBeenCalled()
  })

  it('shows no next lesson after the last playable lesson', async () => {
    const user = userEvent.setup()
    getLessonProgressMock.mockResolvedValue({
      lesson_id: 'concept-002',
      status: 'completed',
      attempts_count: 1,
      completed_at: '2026-11-01T11:00:00.000Z',
      metadata: { step: 5, quizScore: 3, activityDone: true },
    })
    renderLesson('/journey/concept-002')

    expect(await screen.findByText(/Review mode/)).toBeInTheDocument()
    for (let count = 0; count < 5; count += 1) {
      await user.click(screen.getByRole('button', { name: 'Next' }))
    }

    expect(await screen.findByRole('heading', { level: 2, name: 'Congratulations!' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Continue to/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Return to Learning Journey' })).toBeInTheDocument()
  })
})
