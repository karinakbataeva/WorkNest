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
