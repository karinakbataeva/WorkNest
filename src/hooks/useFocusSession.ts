import { useCallback, useEffect, useState } from 'react'
import { getFocusSession } from '../services/storageService'
import { startFocusSession, cancelFocusSession } from '../services/focusService'
import type { FocusSessionState } from '../types'

interface UseFocusSessionResult {
  session: FocusSessionState
  remainingSeconds: number
  isActive: boolean
  start: (focusMinutes: number, breakMinutes: number) => Promise<void>
  cancel: () => Promise<void>
}

export function useFocusSession(): UseFocusSessionResult {
  const [session, setSession] = useState<FocusSessionState>({
    phase: 'idle',
    endTime: null,
    focusMinutes: 25,
    breakMinutes: 5,
    breakCount: 0,
  })
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  useEffect(() => {
    let cancelled = false

    getFocusSession().then((s) => {
      if (!cancelled) setSession(s)
    })

    function handleStorageChange(changes: { [key: string]: chrome.storage.StorageChange }) {
      if (changes.worknest_focus_session) {
        setSession(changes.worknest_focus_session.newValue as FocusSessionState)
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      cancelled = true
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  useEffect(() => {
    if (!session.endTime) {
      setRemainingSeconds(0)
      return
    }

    function tick() {
      const remaining = Math.max(0, Math.round((session.endTime! - Date.now()) / 1000))
      setRemainingSeconds(remaining)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [session.endTime])

  const start = useCallback(async (focusMinutes: number, breakMinutes: number) => {
    const newState = await startFocusSession(focusMinutes, breakMinutes)
    setSession(newState)
  }, [])

  const cancel = useCallback(async () => {
    const newState = await cancelFocusSession()
    setSession(newState)
  }, [])

  return {
    session,
    remainingSeconds,
    isActive: session.phase === 'focus',
    start,
    cancel,
  }
}
