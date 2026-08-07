import type { Tab, Workspace } from '../types'
import { getWorkspaces, setWorkspaces } from './storageService'

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

  return newWorkspace
}
