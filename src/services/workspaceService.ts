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

/**
 * Opens every tab in a workspace inside a brand new browser window.
 */
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
}

/**
 * Renames a workspace by id and persists the change.
 */
export async function renameWorkspace(id: string, newName: string): Promise<void> {
  const trimmed = newName.trim()
  if (!trimmed) return

  const existing = await getWorkspaces()
  const updated = existing.map((ws) =>
    ws.id === id ? { ...ws, name: trimmed, updatedAt: Date.now() } : ws
  )
  await setWorkspaces(updated)
}

/**
 * Deletes a workspace by id and persists the change.
 */
export async function deleteWorkspace(id: string): Promise<void> {
  const existing = await getWorkspaces()
  const updated = existing.filter((ws) => ws.id !== id)
  await setWorkspaces(updated)
}
