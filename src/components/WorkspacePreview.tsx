import type { Workspace } from '../types'

interface WorkspacePreviewProps {
  workspace: Workspace
}

export function WorkspacePreview({ workspace }: WorkspacePreviewProps) {
  return (
    <div className="absolute left-0 top-full z-10 mt-1 w-72 max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-1.5">
      {workspace.tabs.length === 0 ? (
        <p className="px-2 py-1.5 text-xs text-gray-400 dark:text-gray-500">No tabs saved</p>
      ) : (
        workspace.tabs.map((tab) => (
          <div key={tab.id} className="flex items-center gap-2 rounded-md px-2 py-1">
            {tab.favIconUrl ? (
              <img
                src={tab.favIconUrl}
                alt=""
                className="w-3.5 h-3.5 shrink-0 rounded-sm"
                onError={(e) => {
                  e.currentTarget.style.visibility = 'hidden'
                }}
              />
            ) : (
              <div className="w-3.5 h-3.5 shrink-0 rounded-sm bg-gray-200 dark:bg-gray-700" />
            )}
            <p className="truncate text-xs text-gray-700 dark:text-gray-300">{tab.title}</p>
          </div>
        ))
      )}
    </div>
  )
}
