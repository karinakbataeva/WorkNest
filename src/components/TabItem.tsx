import { useState } from 'react'
import { Pin, X, FolderPlus } from 'lucide-react'
import type { Tab, Workspace } from '../types'

interface TabItemProps {
  tab: Tab
  isDuplicate?: boolean
  onClose?: (tabId: number) => void
  workspaces?: Workspace[]
  onAddToWorkspace?: (workspaceId: string, tab: Tab) => void
}

export function TabItem({
  tab,
  isDuplicate = false,
  onClose,
  workspaces = [],
  onAddToWorkspace,
}: TabItemProps) {
  const [isPicking, setIsPicking] = useState(false)

  if (isPicking) {
    return (
      <div className="flex flex-col gap-0.5 rounded-lg border border-gray-200 dark:border-gray-700 px-2 py-1.5">
        <div className="flex items-center justify-between px-1 pb-1">
          <p className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">
            Add "{tab.title}" to…
          </p>
          <button
            onClick={() => setIsPicking(false)}
            className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {workspaces.length === 0 ? (
          <p className="px-1 pb-1 text-xs text-gray-400 dark:text-gray-500">No workspaces yet.</p>
        ) : (
          <div className="flex flex-col gap-0.5 max-h-32 overflow-y-auto">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  onAddToWorkspace?.(ws.id, tab)
                  setIsPicking(false)
                }}
                className="truncate rounded-md px-2 py-1 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {ws.name}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      {tab.favIconUrl ? (
        <img
          src={tab.favIconUrl}
          alt=""
          className="w-4 h-4 shrink-0 rounded-sm"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden'
          }}
        />
      ) : (
        <div className="w-4 h-4 shrink-0 rounded-sm bg-gray-200 dark:bg-gray-700" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
            {tab.title}
          </p>
          {isDuplicate && (
            <span className="shrink-0 rounded-full bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
              Duplicate
            </span>
          )}
        </div>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
          {tab.url}
        </p>
      </div>

      {tab.pinned && (
        <Pin className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
      )}

      {onAddToWorkspace && (
        <button
          onClick={() => setIsPicking(true)}
          className="shrink-0 rounded-md p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-all"
          aria-label="Add to workspace"
        >
          <FolderPlus className="w-3.5 h-3.5" />
        </button>
      )}

      {onClose && (
        <button
          onClick={() => onClose(tab.id)}
          className="shrink-0 rounded-md p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-all"
          aria-label="Close tab"
        > <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
