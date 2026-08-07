import type { FocusSessionState } from '../types'
import { getFocusSession, setFocusSession } from './storageService'

export const FOCUS_ALARM_NAME = 'worknest-focus-alarm'

/**
 * Starts a new focus session: sets phase to 'focus', schedules an alarm
 * to fire when it ends, and persists the state.
 */
export async function startFocusSession(
  focusMinutes: number,
  breakMinutes: number
): Promise<FocusSessionState> {
  const endTime = Date.now() + focusMinutes * 60 * 1000

  const newState: FocusSessionState = {
    phase: 'focus',
    endTime,
    focusMinutes,
    breakMinutes,
  }

  await setFocusSession(newState)
  await chrome.alarms.create(FOCUS_ALARM_NAME, { when: endTime })

  return newState
}

/**
 * Cancels the active session entirely, clearing the alarm and resetting to idle.
 */
export async function cancelFocusSession(): Promise<FocusSessionState> {
  await chrome.alarms.clear(FOCUS_ALARM_NAME)

  const current = await getFocusSession()
  const newState: FocusSessionState = {
    phase: 'idle',
    endTime: null,
    focusMinutes: current.focusMinutes,
    breakMinutes: current.breakMinutes,
  }

  await setFocusSession(newState)
  return newState
}
