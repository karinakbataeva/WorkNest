import { useState } from 'react'
import { FolderOpen, Pencil, Trash2, Check, X, AlertTriangle, StickyNote, Plus } from 'lucide-react'
import type { Workspace } from '../types'
import { WorkspacePreview } from './WorkspacePreview'
import { WorkspaceNotePopover } from './WorkspaceNotePopover'
import { WorkspaceResumeConfirm } from './WorkspaceResumeConfirm'

interface WorkspaceItemProps {
  workspace: Workspace
  focusActive: boolean
  onRestore: (workspace: Workspace) => void
  onRename: (id: string, newName: string) => void
  onDelete: (id: string) => void
  onUpdateNote: (id: string, note: string) => void
}

type Mode = 'idle' | 'editingName' | 'confirmFocus' | 'resumeConfirm'

export function WorkspaceItem({
  workspace,
  focusActive,
  onRestore,
  onRename,
  onDelete,
  onUpdateNote,
}: WorkspaceItemProps) {
  const [mode, setMode] = useState<Mode>('idle')
  const [draftName, setDraftName] = useState(workspace.name)
  const [isHovered, setIsHovered] = useState(false)
  const [notePopoverOpen, setNotePopoverOpen] = useState(false)

  function handleConfirmRename() {
    if (draftName.trim() && draftName.trim() !== workspace.name) {
      onRename(workspace.id, draftName)
    }
    setMode('idle')
  }

  function handleCancelRename() {
    setDraftName(workspace.name)
    setMode('idle')
  }

  function handleRestoreClick() {
    if (focusActive) {
      setMode('confirmFocus')
    } else if (workspace.note) {
      setMode('resumeConfirm')
    } else {
      onRestore(workspace)
    }
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault()
    if (mode === 'idle') setNotePopoverOpen(true)
  }

  function handleNoteAffordanceClick(e: React.MouseEvent) {
    e.stopPropagation()
    setNotePopoverOpen(true)
  }

  if (mode === 'editingName') {
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

  if (mode === 'confirmFocus') {
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
              setMode('idle')
            }}
            className="rounded-md bg-amber-600 hover:bg-amber-700 px-2 py-1 text-xs font-medium text-white transition-colors"
          >
            Restore anyway
          </button>
          <button
            onClick={() => setMode('idle')}
            className="rounded-md border border-amber-300 dark:border-amber-800 px-2 py-1 text-xs font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'resumeConfirm') {
    return (
      <WorkspaceResumeConfirm
        workspace={workspace}
        onConfirm={() => {
          onRestore(workspace)
          setMode('idle')
        }}
        onCancel={() => setMode('idle')}
      />
    )
  }

  return (
    <div
      className="group relative flex flex-col rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={handleContextMenu}
    >
      <div className="flex items-center gap-3">
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
            onClick={() => setMode('editingName')}
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
      </div>

      <div className="pl-7 mt-0.5">
        {workspace.note ? (
          <button
            onClick={handleNoteAffordanceClick}
            className="flex w-full items-center gap-1 truncate text-left text-xs text-amber-600 dark:text-amber-400 hover:underline"
          >
            <StickyNote className="w-3 h-3 shrink-0" />
            <span className="truncate">{workspace.note}</span>
          </button>
        ) : (
          <button
            onClick={handleNoteAffordanceClick}
            className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Plus className="w-3 h-3 shrink-0" />
            Add note
          </button>
        )}
      </div>

      {isHovered && !notePopoverOpen && <WorkspacePreview workspace={workspace} />}

      {notePopoverOpen && (
        <WorkspaceNotePopover
          note={workspace.note}
          onSave={(note) => onUpdateNote(workspace.id, note)}
          onDeleteNote={() => onUpdateNote(workspace.id, '')}
          onClose={() => setNotePopoverOpen(false)}
        />
      )}
    </div>
  )
}
