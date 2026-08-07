import { useCallback, useEffect, useState } from 'react'
import { getWorkspaces } from '../services'
import { createWorkspace } from '../services/workspaceService'
import type { Tab, Workspace } from '../types'

interface UseWorkspacesResult {
  workspaces: Workspace[]
  isLoading: boolean
  error: string | null
  saveWorkspace: (name: string, tabs: Tab[]) => Promise<void>
  isSaving: boolean
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

  return { workspaces, isLoading, error, saveWorkspace, isSaving }
}
