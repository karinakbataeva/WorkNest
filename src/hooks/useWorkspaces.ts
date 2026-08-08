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
