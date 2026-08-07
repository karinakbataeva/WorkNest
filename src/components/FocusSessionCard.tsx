import { useState } from 'react'
import { Timer, X } from 'lucide-react'
import type { FocusSessionState } from '../types'

interface FocusSessionCardProps {
  session: FocusSessionState
  remainingSeconds: number
  onStart: (focusMinutes: number, breakMinutes: number) => void
  onCancel: () => void
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function FocusSessionCard({
  session,
  remainingSeconds,
  onStart,
  onCancel,
}: FocusSessionCardProps) {
  const [focusMinutes, setFocusMinutes] = useState(session.focusMinutes)
  const [breakMinutes, setBreakMinutes] = useState(session.breakMinutes)

  if (session.phase === 'idle') {
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-2.5 mb-1">
        <div className="flex items-center gap-2 mb-2">
          <Timer className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Focus Session</p>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <label className="flex-1 text-xs text-gray-500 dark:text-gray-400">
            Focus
            <input
              type="number"
              min={1}
              max={120}
              value={focusMinutes}
              onChange={(e) => setFocusMinutes(Number(e.target.value))}
              className="mt-0.5 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label className="flex-1 text-xs text-gray-500 dark:text-gray-400">
            Break
            <input
              type="number"
              min={1}
              max={60}
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
              className="mt-0.5 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
        </div>
        <button
          onClick={() => onStart(focusMinutes, breakMinutes)}
          className="w-full rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-sm font-medium text-white transition-colors"
        >
          Start Focus Session
        </button>
      </div>
    )
  }

  const isFocusPhase = session.phase === 'focus'

  return (
    <div
      className={`rounded-lg border p-2.5 mb-1 ${
        isFocusPhase
          ? 'border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30'
          : 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer
            className={`w-4 h-4 ${
              isFocusPhase
                ? 'text-blue-500 dark:text-blue-400'
                : 'text-green-500 dark:text-green-400'
            }`}
          />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {isFocusPhase ? 'Focus time' : 'Break time'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
              {formatTime(remainingSeconds)} remaining
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Cancel focus session"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
