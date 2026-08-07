export type FocusPhase = 'idle' | 'focus' | 'break'

export interface FocusSessionState {
  phase: FocusPhase
  endTime: number | null
  focusMinutes: number
  breakMinutes: number
  breakCount: number
}
