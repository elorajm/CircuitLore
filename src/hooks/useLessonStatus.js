import { useEffect, useState } from 'react'
import { useAuth } from './useAuth.js'
import { getLessonProgress } from '../services/progressService.js'

/**
 * Returns 'checking' while auth or saved progress is loading, 'signed-out' for visitors,
 * 'error' when progress could not be loaded, or the saved status: 'not_started',
 * 'in_progress', or 'completed'. Completion is only reported when the saved row says so.
 */
export function useLessonStatus(lessonId) {
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? null
  const requestKey = userId ? `${userId}:${lessonId}` : null
  const [result, setResult] = useState({ key: null, status: 'ready', record: null })

  useEffect(() => {
    if (!requestKey) return undefined
    let cancelled = false

    getLessonProgress(lessonId).then(
      (record) => {
        if (!cancelled) setResult({ key: requestKey, status: 'ready', record })
      },
      () => {
        if (!cancelled) setResult({ key: requestKey, status: 'error', record: null })
      },
    )

    return () => {
      cancelled = true
    }
  }, [requestKey, lessonId])

  if (authLoading) return 'checking'
  if (!userId) return 'signed-out'
  if (result.key !== requestKey) return 'checking'
  if (result.status === 'error') return 'error'
  return result.record?.status ?? 'not_started'
}
