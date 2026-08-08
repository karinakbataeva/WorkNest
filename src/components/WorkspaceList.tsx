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
