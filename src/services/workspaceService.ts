import type { Tab, Workspace } from '../types'
import { getWorkspaces, setWorkspaces } from './storageService'
import { getAllTabs } from './tabsService'

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
 * Generates a readable default name like "Workspace — Aug 7, 5:45 PM".
 */
function generateTimestampName(): string {
  const formatted = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  return `Workspace — ${formatted}`
}

/**
 * Captures ALL current open tabs and saves them as a new workspace,
 * with an auto-generated timestamp name. Used by the quick-save
 * keyboard shortcut, which has no UI to collect a custom name.
 */
export async function quickSaveCurrentTabs(): Promise<Workspace> {
  const tabs = await getAllTabs()
  return createWorkspace(generateTimestampName(), tabs)
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

export async function deleteWorkspace(id: string): Promise<void> {
  const existing = await getWorkspaces()
  const updated = existing.filter((ws) => ws.id !== id)
  await setWorkspaces(updated)
}
