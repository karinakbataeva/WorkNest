import type { Workspace } from '../types'

const STORAGE_KEY = 'worknest_workspaces'

export async function getWorkspaces(): Promise<Workspace[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY)
  const workspaces = result[STORAGE_KEY]
  return Array.isArray(workspaces) ? workspaces : []
}

export async function setWorkspaces(workspaces: Workspace[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: workspaces })
}
