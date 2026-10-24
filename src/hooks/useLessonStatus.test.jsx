import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useLessonStatus } from './useLessonStatus.js'

const { useAuthMock, getLessonProgressMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  getLessonProgressMock: vi.fn(),
}))

vi.mock('./useAuth.js', () => ({
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

describe('useLessonStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reports checking while the session is still loading and never reads progress', () => {
    useAuthMock.mockReturnValue({ user: null, loading: true })
    const { result } = renderHook(() => useLessonStatus('history-001'))

    expect(result.current).toBe('checking')
    expect(getLessonProgressMock).not.toHaveBeenCalled()
  })

  it('reports signed-out for a visitor without loading progress', () => {
    useAuthMock.mockReturnValue(signedOut)
    const { result } = renderHook(() => useLessonStatus('history-001'))

    expect(result.current).toBe('signed-out')
    expect(getLessonProgressMock).not.toHaveBeenCalled()
  })

  it('stays checking, never signed-out, while a signed-in student’s progress loads', () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockReturnValue(new Promise(() => {}))
    const { result } = renderHook(() => useLessonStatus('history-001'))

    expect(result.current).toBe('checking')
  })

  it('reports not_started when the student has no progress row', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockResolvedValue(null)
    const { result } = renderHook(() => useLessonStatus('history-001'))

    await waitFor(() => expect(result.current).toBe('not_started'))
    expect(getLessonProgressMock).toHaveBeenCalledWith('history-001')
  })

  it('reports in_progress from the saved row', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockResolvedValue(record('in_progress'))
    const { result } = renderHook(() => useLessonStatus('history-001'))

    await waitFor(() => expect(result.current).toBe('in_progress'))
  })

  it('reports completed only when the saved row says completed', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockResolvedValue(record('completed'))
    const { result } = renderHook(() => useLessonStatus('history-001'))

    await waitFor(() => expect(result.current).toBe('completed'))
  })

  it('reports error and never completed when progress cannot be loaded', async () => {
    useAuthMock.mockReturnValue(signedIn)
    getLessonProgressMock.mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useLessonStatus('history-001'))

    await waitFor(() => expect(result.current).toBe('error'))
  })

  it('does not reuse one student’s result after the account changes', async () => {
    useAuthMock.mockReturnValue({ user: { id: 'student-1' }, loading: false })
    getLessonProgressMock.mockResolvedValueOnce(record('completed'))
    const { result, rerender } = renderHook(() => useLessonStatus('history-001'))
    await waitFor(() => expect(result.current).toBe('completed'))

    getLessonProgressMock.mockReturnValueOnce(new Promise(() => {}))
    useAuthMock.mockReturnValue({ user: { id: 'student-2' }, loading: false })
    rerender()

    expect(result.current).toBe('checking')
  })
})
