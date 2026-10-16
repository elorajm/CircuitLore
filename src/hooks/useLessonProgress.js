import { useCallback, useEffect, useRef, useState } from 'react'
import { getLessonProgress, saveProgress } from '../services/progressService.js'

export function useLessonProgress(lessonId) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState({ key: null, status: 'loading', record: null })
  const [saveState, setSaveState] = useState('idle')
  const pendingRef = useRef(null)

  useEffect(() => {
    const key = `${lessonId}:${attempt}`
    let cancelled = false

    getLessonProgress(lessonId).then(
      (record) => {
        if (!cancelled) setResult({ key, status: 'ready', record })
      },
      () => {
        if (!cancelled) setResult({ key, status: 'error', record: null })
      },
    )

    return () => {
      cancelled = true
    }
  }, [lessonId, attempt])

  const persist = useCallback(
    async (status, metadata, onSaved) => {
      pendingRef.current = { status, metadata, onSaved }
      setSaveState('saving')

      try {
        const saved = await saveProgress(lessonId, status, metadata)
        pendingRef.current = null
        setResult((prev) => ({ ...prev, record: saved }))
        setSaveState('idle')
        onSaved?.()
        return true
      } catch {
        setSaveState('failed')
        return false
      }
    },
    [lessonId],
  )

  const retrySave = useCallback(() => {
    const pending = pendingRef.current
    if (!pending) return Promise.resolve(false)
    return persist(pending.status, pending.metadata, pending.onSaved)
  }, [persist])

  const reload = useCallback(() => setAttempt((count) => count + 1), [])

  const currentKey = `${lessonId}:${attempt}`
  const loadStatus = result.key === currentKey ? result.status : 'loading'

  return {
    loadStatus,
    record: result.record,
    saveState,
    persist,
    retrySave,
    reload,
  }
}
