import { FolderOpen, StickyNote } from 'lucide-react'
import type { Workspace } from '../types'

interface WorkspaceResumeConfirmProps {
  workspace: Workspace
  onConfirm: () => void
  onCancel: () => void
}

export function WorkspaceResumeConfirm({
  workspace,
  onConfirm,
  onCancel,
}: WorkspaceResumeConfirmProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <FolderOpen className="w-4 h-4 shrink-0 text-blue-500 dark:text-blue-400" />
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {workspace.name}
        </p>
      </div>

      {workspace.note && (
        <div className="flex items-start gap-1.5 rounded-md bg-amber-50 dark:bg-amber-950/30 px-2 py-1.5">
          <StickyNote className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
          <p className="text-xs text-amber-800 dark:text-amber-300 whitespace-pre-wrap">
            {workspace.note}
          </p>
        </div>
      )}

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {workspace.tabs.length} {workspace.tabs.length === 1 ? 'tab' : 'tabs'} will be opened
      </p>

      <div className="flex justify-end gap-1.5">
        <button
          onClick={onCancel}
          className="rounded-md px-2.5 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="rounded-md bg-blue-600 hover:bg-blue-700 px-2.5 py-1 text-xs font-medium text-white transition-colors"
        >
          Resume
        </button>
      </div>
    </div>
  )
}
