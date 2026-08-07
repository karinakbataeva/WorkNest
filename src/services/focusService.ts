import type { FocusSessionState } from '../types'
import { getFocusSession, setFocusSession } from './storageService'

export const FOCUS_ALARM_NAME = 'worknest-focus-alarm'

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
    breakCount: 0,
  }

  await setFocusSession(newState)
  await chrome.alarms.create(FOCUS_ALARM_NAME, { when: endTime })

  return newState
}

export async function cancelFocusSession(): Promise<FocusSessionState> {
  await chrome.alarms.clear(FOCUS_ALARM_NAME)

  const current = await getFocusSession()
  const newState: FocusSessionState = {
    phase: 'idle',
    endTime: null,
    focusMinutes: current.focusMinutes,
    breakMinutes: current.breakMinutes,
    breakCount: 0,
  }

  await setFocusSession(newState)
  return newState
}
