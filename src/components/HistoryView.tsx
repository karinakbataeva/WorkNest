import { ArrowLeft, Save, FolderOpen } from 'lucide-react'
import type { HistoryEntry } from '../types'

interface HistoryViewProps {
  history: HistoryEntry[]
  isLoading: boolean
  onBack: () => void
}

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays}d ago`
}

export function HistoryView({ history, isLoading, onBack }: HistoryViewProps) {
  return (
    <div className="w-[360px] h-[600px] overflow-y-auto bg-white dark:bg-gray-900">
      <header className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={onBack}
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">History</h1>
      </header>

      <div className="p-2">
        {isLoading && (
          <p className="px-3 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            Loading…
          </p>
        )}

        {!isLoading && history.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">No history yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Saved and opened workspaces from the last 30 days will show up here.
            </p>
          </div>
        )}

        {!isLoading &&
          history.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2"
            >
              {entry.action === 'saved' ? (
                <Save className="w-3.5 h-3.5 shrink-0 text-blue-500 dark:text-blue-400" />
              ) : (
                <FolderOpen className="w-3.5 h-3.5 shrink-0 text-green-500 dark:text-green-400" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-900 dark:text-gray-100">
                  <span className="font-medium">
                    {entry.action === 'saved' ? 'Saved' : 'Opened'}
                  </span>{' '}
                  "{entry.workspaceName}"
                </p>
              </div>
              <p className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                {formatRelativeTime(entry.timestamp)}
              </p>
            </div>
          ))}
      </div>
    </div>
  )
}
