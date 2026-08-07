import { useCallback, useEffect, useState } from 'react'
import { getWorkspaces } from '../services'
import {
  createWorkspace,
  restoreWorkspace,
  renameWorkspace,
  deleteWorkspace,
} from '../services/workspaceService'
import type { Tab, Workspace } from '../types'

interface UseWorkspacesResult {
  workspaces: Workspace[]
  isLoading: boolean
  error: string | null
  isSaving: boolean
  saveWorkspace: (name: string, tabs: Tab[]) => Promise<void>
  restore: (workspace: Workspace) => Promise<void>
  rename: (id: string, newName: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

export function useWorkspaces(): UseWorkspacesResult {
  const [workspaces, setWorkspacesState] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      try {
        const result = await getWorkspaces()
        if (!cancelled) setWorkspacesState(result)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load workspaces')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

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

  const remove = useCallback(async (id: string) => {
    try {
      await deleteWorkspace(id)
      setWorkspacesState((prev) => prev.filter((ws) => ws.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workspace')
      throw err
    }
  }, [])

  return { workspaces, isLoading, error, isSaving, saveWorkspace, restore, rename, remove }
}
