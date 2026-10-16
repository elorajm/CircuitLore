import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useLessonProgress } from './useLessonProgress.js'

const { saveProgressMock, getLessonProgressMock } = vi.hoisted(() => ({
  saveProgressMock: vi.fn(),
  getLessonProgressMock: vi.fn(),
}))

vi.mock('../services/progressService.js', () => ({
  saveProgress: saveProgressMock,
  getLessonProgress: getLessonProgressMock,
}))

const savedRecord = {
  lesson_id: 'history-001',
  status: 'in_progress',
  attempts_count: 1,
  completed_at: null,
  metadata: { step: 1, quizScore: null, activityDone: false },
}

describe('useLessonProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads the saved record without making any write', async () => {
    getLessonProgressMock.mockResolvedValue(savedRecord)

    const { result } = renderHook(() => useLessonProgress('history-001'))

    await waitFor(() => expect(result.current.loadStatus).toBe('ready'))
    expect(result.current.record).toEqual(savedRecord)
    expect(getLessonProgressMock).toHaveBeenCalledWith('history-001')
    expect(saveProgressMock).not.toHaveBeenCalled()
  })

  it('reports a load error and reloads when asked', async () => {
    getLessonProgressMock.mockRejectedValueOnce(new Error('network down'))
    getLessonProgressMock.mockResolvedValueOnce(null)

    const { result } = renderHook(() => useLessonProgress('history-001'))

    await waitFor(() => expect(result.current.loadStatus).toBe('error'))

    act(() => result.current.reload())

    await waitFor(() => expect(result.current.loadStatus).toBe('ready'))
    expect(result.current.record).toBeNull()
  })

  it('calls onSaved and updates the record after a successful save', async () => {
    getLessonProgressMock.mockResolvedValue(null)
    saveProgressMock.mockResolvedValue(savedRecord)
    const onSaved = vi.fn()

    const { result } = renderHook(() => useLessonProgress('history-001'))
    await waitFor(() => expect(result.current.loadStatus).toBe('ready'))

    await act(async () => {
      await result.current.persist('in_progress', { step: 1, quizScore: null, activityDone: false }, onSaved)
    })

    expect(saveProgressMock).toHaveBeenCalledWith('history-001', 'in_progress', {
      step: 1,
      quizScore: null,
      activityDone: false,
    })
    expect(onSaved).toHaveBeenCalledTimes(1)
    expect(result.current.record).toEqual(savedRecord)
    expect(result.current.saveState).toBe('idle')
  })

  it('keeps the step unchanged on a failed save and retries the same write', async () => {
    getLessonProgressMock.mockResolvedValue(null)
    saveProgressMock.mockRejectedValueOnce(new Error('Failed to save progress: offline'))
    saveProgressMock.mockResolvedValueOnce(savedRecord)
    const onSaved = vi.fn()

    const { result } = renderHook(() => useLessonProgress('history-001'))
    await waitFor(() => expect(result.current.loadStatus).toBe('ready'))

    await act(async () => {
      await result.current.persist('in_progress', { step: 1, quizScore: null, activityDone: false }, onSaved)
    })

    expect(onSaved).not.toHaveBeenCalled()
    expect(result.current.saveState).toBe('failed')

    await act(async () => {
      await result.current.retrySave()
    })

    expect(saveProgressMock).toHaveBeenCalledTimes(2)
    expect(saveProgressMock).toHaveBeenLastCalledWith('history-001', 'in_progress', {
      step: 1,
      quizScore: null,
      activityDone: false,
    })
    expect(onSaved).toHaveBeenCalledTimes(1)
    expect(result.current.saveState).toBe('idle')
  })
})
