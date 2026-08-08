cd .

rm -f src/components/WorkspaceContextMenu.tsx src/components/WorkspaceNoteForm.tsx

cat > src/types/workspace.types.ts << 'WORKNEST_EOF'
import type { Tab } from './tab.types'

export interface Workspace {
  id: string
  name: string
  tabs: Tab[]
  note?: string
  createdAt: number
  updatedAt: number
}
WORKNEST_EOF

cat > src/services/workspaceService.ts << 'WORKNEST_EOF'
import type { Tab, Workspace } from '../types'
import { getWorkspaces, setWorkspaces } from './storageService'
import { getAllTabs } from './tabsService'
import { logHistoryEvent } from './historyService'

export async function createWorkspace(name: string, tabs: Tab[]): Promise<Workspace> {
  const now = Date.now()
  const newWorkspace: Workspace = {
    id: crypto.randomUUID(),
    name: name.trim() || 'Untitled Workspace',
    tabs,
    createdAt: now,
    updatedAt: now,
  }

  const existing = await getWorkspaces()
  await setWorkspaces([...existing, newWorkspace])
  await logHistoryEvent(newWorkspace.name, 'saved')

  return newWorkspace
}

/**
 * Creates a new, empty workspace with no tabs -- the user adds tabs to it
 * afterward via the per-tab "add to workspace" action.
 */
export async function createEmptyWorkspace(name: string): Promise<Workspace> {
  return createWorkspace(name, [])
}

function generateTimestampName(): string {
  const formatted = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  return `Workspace — ${formatted}`
}

export async function quickSaveCurrentTabs(): Promise<Workspace> {
  const tabs = await getAllTabs()
  return createWorkspace(generateTimestampName(), tabs)
}

export async function addTabsToWorkspace(
  workspaceId: string,
  tabsToAdd: Tab[]
): Promise<number> {
  const existing = await getWorkspaces()
  const workspace = existing.find((ws) => ws.id === workspaceId)
  if (!workspace) throw new Error('Workspace not found')

  const existingUrls = new Set(workspace.tabs.map((t) => t.url))
  const newTabs = tabsToAdd.filter((t) => !existingUrls.has(t.url))

  const updated = existing.map((ws) =>
    ws.id === workspaceId
      ? { ...ws, tabs: [...ws.tabs, ...newTabs], updatedAt: Date.now() }
      : ws
  )

  await setWorkspaces(updated)
  return newTabs.length
}

export async function restoreWorkspace(workspace: Workspace): Promise<void> {
  if (workspace.tabs.length === 0) return

  const [firstTab, ...restTabs] = workspace.tabs

  const newWindow = await chrome.windows.create({ url: firstTab.url, focused: true })

  if (!newWindow || newWindow.id === undefined) {
    throw new Error('Failed to create window for workspace restore')
  }

  const windowId = newWindow.id

  for (const tab of restTabs) {
    await chrome.tabs.create({ windowId, url: tab.url, active: false })
  }

  await logHistoryEvent(workspace.name, 'restored')
}

export async function renameWorkspace(id: string, newName: string): Promise<void> {
  const trimmed = newName.trim()
  if (!trimmed) return

  const existing = await getWorkspaces()
  const updated = existing.map((ws) =>
    ws.id === id ? { ...ws, name: trimmed, updatedAt: Date.now() } : ws
  )
  await setWorkspaces(updated)
}

export async function updateWorkspaceNote(id: string, note: string): Promise<void> {
  const trimmed = note.trim()

  const existing = await getWorkspaces()
  const updated = existing.map((ws) =>
    ws.id === id ? { ...ws, note: trimmed || undefined, updatedAt: Date.now() } : ws
  )
  await setWorkspaces(updated)
}

export async function deleteWorkspace(id: string): Promise<void> {
  const existing = await getWorkspaces()
  const updated = existing.filter((ws) => ws.id !== id)
  await setWorkspaces(updated)
}
WORKNEST_EOF

cat > src/hooks/useWorkspaces.ts << 'WORKNEST_EOF'
import { useCallback, useEffect, useState } from 'react'
import { getWorkspaces } from '../services'
import {
  createWorkspace,
  createEmptyWorkspace,
  restoreWorkspace,
  renameWorkspace,
  deleteWorkspace,
  addTabsToWorkspace,
  updateWorkspaceNote,
} from '../services/workspaceService'
import type { Tab, Workspace } from '../types'

interface UseWorkspacesResult {
  workspaces: Workspace[]
  isLoading: boolean
  error: string | null
  isSaving: boolean
  saveWorkspace: (name: string, tabs: Tab[]) => Promise<void>
  createEmpty: (name: string) => Promise<void>
  restore: (workspace: Workspace) => Promise<void>
  rename: (id: string, newName: string) => Promise<void>
  remove: (id: string) => Promise<void>
  updateNote: (id: string, note: string) => Promise<void>
  addToWorkspace: (workspaceId: string, tabs: Tab[]) => Promise<number>
  refresh: () => Promise<void>
}

export function useWorkspaces(): UseWorkspacesResult {
  const [workspaces, setWorkspacesState] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await getWorkspaces()
      setWorkspacesState(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workspaces')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saveWorkspace = useCallback(async (name: string, tabs: Tab[]) => {
    setIsSaving(true)
    setError(null)
    try {
      const newWorkspace = await createWorkspace(name, tabs)
      setWorkspacesState((prev) => [...prev, newWorkspace])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workspace')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [])

  const createEmpty = useCallback(async (name: string) => {
    setIsSaving(true)
    setError(null)
    try {
      const newWorkspace = await createEmptyWorkspace(name)
      setWorkspacesState((prev) => [...prev, newWorkspace])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace')
      throw err
    } finally {
      setIsSaving(false)
    }
  }, [])

  const restore = useCallback(async (workspace: Workspace) => {
    try {
      await restoreWorkspace(workspace)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore workspace')
      throw err
    }
  }, [])

  const rename = useCallback(async (id: string, newName: string) => {
    try {
      await renameWorkspace(id, newName)
      setWorkspacesState((prev) =>
        prev.map((ws) => (ws.id === id ? { ...ws, name: newName.trim(), updatedAt: Date.now() } : ws))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename workspace')
      throw err
    }
  }, [])

  const updateNote = useCallback(async (id: string, note: string) => {
    try {
      await updateWorkspaceNote(id, note)
      const trimmed = note.trim()
      setWorkspacesState((prev) =>
        prev.map((ws) =>
          ws.id === id ? { ...ws, note: trimmed || undefined, updatedAt: Date.now() } : ws
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note')
      throw err
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    try {
      await deleteWorkspace(id)
      setWorkspacesState((prev) => prev.filter((ws) => ws.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workspace')
      throw err
    }
  }, [])

  const addToWorkspace = useCallback(async (workspaceId: string, tabs: Tab[]) => {
    try {
      const addedCount = await addTabsToWorkspace(workspaceId, tabs)
      await load()
      return addedCount
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add tabs to workspace')
      throw err
    }
  }, [load])

  return {
    workspaces,
    isLoading,
    error,
    isSaving,
    saveWorkspace,
    createEmpty,
    restore,
    rename,
    remove,
    updateNote,
    addToWorkspace,
    refresh: load,
  }
}
WORKNEST_EOF

cat > src/components/WorkspaceNotePopover.tsx << 'WORKNEST_EOF'
import { useEffect, useRef, useState } from 'react'
import { Pencil, StickyNote, Trash2 } from 'lucide-react'

interface WorkspaceNotePopoverProps {
  note: string | undefined
  onSave: (note: string) => void
  onDeleteNote: () => void
  onClose: () => void
}

export function WorkspaceNotePopover({
  note,
  onSave,
  onDeleteNote,
  onClose,
}: WorkspaceNotePopoverProps) {
  const [editing, setEditing] = useState(!note)
  const [draft, setDraft] = useState(note ?? '')
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  function handleSave() {
    onSave(draft)
    onClose()
  }

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full z-20 mt-1 w-72 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-2.5"
    >
      {editing ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <StickyNote className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Add note</p>
          </div>
          <textarea
            autoFocus
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
            }}
            placeholder="What were you working on?"
            className="w-full resize-none rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-1.5">
            <button
              onClick={onClose}
              className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-blue-600 hover:bg-blue-700 px-2 py-1 text-xs font-medium text-white transition-colors"
            >
              Save note
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Note</p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                onClick={() => setEditing(true)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Edit note"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  onDeleteNote()
                  onClose()
                }}
                className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors"
                aria-label="Delete note"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          <p className="text-[15px] leading-snug font-medium text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{note}</p>
        </div>
      )}
    </div>
  )
}
WORKNEST_EOF

cat > src/components/WorkspaceResumeConfirm.tsx << 'WORKNEST_EOF'
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
WORKNEST_EOF

cat > src/components/WorkspaceItem.tsx << 'WORKNEST_EOF'
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
WORKNEST_EOF

cat > src/components/WorkspaceList.tsx << 'WORKNEST_EOF'
import type { Workspace } from '../types'
import { WorkspaceItem } from './WorkspaceItem'

interface WorkspaceListProps {
  workspaces: Workspace[]
  focusActive: boolean
  onRestore: (workspace: Workspace) => void
  onRename: (id: string, newName: string) => void
  onDelete: (id: string) => void
  onUpdateNote: (id: string, note: string) => void
}

export function WorkspaceList({
  workspaces,
  focusActive,
  onRestore,
  onRename,
  onDelete,
  onUpdateNote,
}: WorkspaceListProps) {
  if (workspaces.length === 0) return null

  return (
    <div className="flex flex-col gap-0.5">
      <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        Workspaces
      </p>
      {workspaces.map((workspace) => (
        <WorkspaceItem
          key={workspace.id}
          workspace={workspace}
          focusActive={focusActive}
          onRestore={onRestore}
          onRename={onRename}
          onDelete={onDelete}
          onUpdateNote={onUpdateNote}
        />
      ))}
    </div>
  )
}
WORKNEST_EOF

cat > src/components/index.ts << 'WORKNEST_EOF'
export { TabList } from './TabList'
export { TabItem } from './TabItem'
export { LoadingState } from './LoadingState'
export { EmptyState } from './EmptyState'
export { ErrorState } from './ErrorState'
export { SaveWorkspaceButton } from './SaveWorkspaceButton'
export { WorkspaceList } from './WorkspaceList'
export { WorkspaceItem } from './WorkspaceItem'
export { WorkspacePreview } from './WorkspacePreview'
export { WorkspaceNotePopover } from './WorkspaceNotePopover'
export { WorkspaceResumeConfirm } from './WorkspaceResumeConfirm'
export { SearchInput } from './SearchInput'
export { ThemeToggle } from './ThemeToggle'
export { FocusSessionCard } from './FocusSessionCard'
export { HistoryView } from './HistoryView'
WORKNEST_EOF

cat > src/popup/App.tsx << 'WORKNEST_EOF'
import { useMemo, useState } from 'react'
import { History } from 'lucide-react'
import { useTabs } from '../hooks/useTabs'
import { useWorkspaces } from '../hooks/useWorkspaces'
import { useTheme } from '../hooks/useTheme'
import { useFocusSession } from '../hooks/useFocusSession'
import { useHistory } from '../hooks/useHistory'
import { TabList } from '../components/TabList'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { SaveWorkspaceButton } from '../components/SaveWorkspaceButton'
import { WorkspaceList } from '../components/WorkspaceList'
import { SearchInput } from '../components/SearchInput'
import { ThemeToggle } from '../components/ThemeToggle'
import { FocusSessionCard } from '../components/FocusSessionCard'
import { HistoryView } from '../components/HistoryView'
import type { Tab } from '../types'

type View = 'main' | 'history'

export default function App() {
  const { tabs, isLoading, error, refresh, closeTab } = useTabs()
  const {
    workspaces,
    createEmpty,
    isSaving,
    restore,
    rename,
    remove,
    updateNote,
    addToWorkspace,
  } = useWorkspaces()
  const { theme, setTheme } = useTheme()
  const { session, remainingSeconds, isActive, start, cancel } = useFocusSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState<View>('main')
  const { history, isLoading: historyLoading } = useHistory(view === 'history')

  const filteredWorkspaces = useMemo(() => {
    if (!searchQuery.trim()) return workspaces
    const query = searchQuery.trim().toLowerCase()
    return workspaces.filter((ws) => ws.name.toLowerCase().includes(query))
  }, [workspaces, searchQuery])

  function handleAddSingleTab(workspaceId: string, tab: Tab) {
    addToWorkspace(workspaceId, [tab])
  }

  if (view === 'history') {
    return (
      <HistoryView history={history} isLoading={historyLoading} onBack={() => setView('main')} />
    )
  }

  return (
    <div className="w-[360px] h-[600px] overflow-y-auto bg-white dark:bg-gray-900">
      <header className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">WorkNest</h1>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setView('history')}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="View history"
          >
            <History className="w-4 h-4" />
          </button>
          <ThemeToggle theme={theme} onChange={setTheme} />
        </div>
      </header>

      <div className="p-2">
        <FocusSessionCard
          session={session}
          remainingSeconds={remainingSeconds}
          onStart={start}
          onCancel={cancel}
        />

        <SaveWorkspaceButton onCreate={createEmpty} isSaving={isSaving} />

        {workspaces.length > 0 && (
          <div className="pt-1 pb-0.5">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search workspaces…"
            />
          </div>
        )}

        <WorkspaceList
          workspaces={filteredWorkspaces}
          focusActive={isActive}
          onRestore={restore}
          onRename={rename}
          onDelete={remove}
          onUpdateNote={updateNote}
        />

        <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

        <p className="px-3 pt-1 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Open Tabs
        </p>

        {isLoading && <LoadingState />}
        {!isLoading && error && <ErrorState message={error} onRetry={refresh} />}
        {!isLoading && !error && tabs.length === 0 && <EmptyState />}
        {!isLoading && !error && tabs.length > 0 && (
          <TabList
            tabs={tabs}
            onCloseTab={closeTab}
            workspaces={workspaces}
            onAddToWorkspace={handleAddSingleTab}
          />
        )}
      </div>
    </div>
  )
}
WORKNEST_EOF

echo "All files written."
