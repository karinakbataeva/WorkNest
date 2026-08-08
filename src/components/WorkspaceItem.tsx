import { useState } from 'react'
import { FolderOpen, Pencil, Trash2, Check, X, AlertTriangle } from 'lucide-react'
import type { Workspace } from '../types'
import { WorkspacePreview } from './WorkspacePreview'

interface WorkspaceItemProps {
  workspace: Workspace
  focusActive: boolean
  onRestore: (workspace: Workspace) => void
  onRename: (id: string, newName: string) => void
  onDelete: (id: string) => void
}

export function WorkspaceItem({
  workspace,
  focusActive,
  onRestore,
  onRename,
  onDelete,
}: WorkspaceItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(workspace.name)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  function handleConfirmRename() {
    if (draftName.trim() && draftName.trim() !== workspace.name) {
      onRename(workspace.id, draftName)
    }
    setIsEditing(false)
  }

  function handleCancelRename() {
    setDraftName(workspace.name)
    setIsEditing(false)
  }

  function handleRestoreClick() {
    if (focusActive) {
      setShowConfirm(true)
    } else {
      onRestore(workspace)
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2">
        <input
          autoFocus
          type="text"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirmRename()
            if (e.key === 'Escape') handleCancelRename()
          }}
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={handleConfirmRename}
          className="rounded-md p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
          aria-label="Confirm rename"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancelRename}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Cancel rename"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Focus session active. Restore this workspace anyway?
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => {
              onRestore(workspace)
              setShowConfirm(false)
            }}
            className="rounded-md bg-amber-600 hover:bg-amber-700 px-2 py-1 text-xs font-medium text-white transition-colors"
          >
            Restore anyway
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="rounded-md border border-amber-300 dark:border-amber-800 px-2 py-1 text-xs font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="group relative flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={handleRestoreClick}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <FolderOpen className="w-4 h-4 shrink-0 text-blue-500 dark:text-blue-400" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
            {workspace.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {workspace.tabs.length}{workspace.tabs.length === 1 ? 'tab' : 'tabs'}
          </p>
        </div>
      </button>

      <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Rename workspace"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(workspace.id)}
          className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors"
          aria-label="Delete workspace"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {isHovered && <WorkspacePreview workspace={workspace} />}
    </div>
  )
}
