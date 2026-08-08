import type { FocusSessionState, HistoryEntry, Theme, Workspace } from '../types'

const WORKSPACES_KEY = 'worknest_workspaces'
const THEME_KEY = 'worknest_theme'
const FOCUS_SESSION_KEY = 'worknest_focus_session'
const HISTORY_KEY = 'worknest_history'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

const DEFAULT_FOCUS_SESSION: FocusSessionState = {
  phase: 'idle',
  endTime: null,
  focusMinutes: 25,
  breakMinutes: 5,
  breakCount: 0,
}

export async function getWorkspaces(): Promise<Workspace[]> {
  const result = await chrome.storage.local.get(WORKSPACES_KEY)
  const workspaces = result[WORKSPACES_KEY]
  return Array.isArray(workspaces) ? workspaces : []
}

export async function setWorkspaces(workspaces: Workspace[]): Promise<void> {
  await chrome.storage.local.set({ [WORKSPACES_KEY]: workspaces })
}

export async function getTheme(): Promise<Theme> {
  const result = await chrome.storage.local.get(THEME_KEY)
  const theme = result[THEME_KEY]
  return theme === 'light' || theme === 'dark' || theme === 'system' ? theme : 'system'
}

export async function setTheme(theme: Theme): Promise<void> {
  await chrome.storage.local.set({ [THEME_KEY]: theme })
}

export async function getFocusSession(): Promise<FocusSessionState> {
  const result = await chrome.storage.local.get(FOCUS_SESSION_KEY)
  const session = result[FOCUS_SESSION_KEY]
  return session ? { ...DEFAULT_FOCUS_SESSION, ...session } : DEFAULT_FOCUS_SESSION
}

export async function setFocusSession(session: FocusSessionState): Promise<void> {
  await chrome.storage.local.set({ [FOCUS_SESSION_KEY]: session })
}

/**
 * Reads history entries, silently dropping anything older than 30 days.
 * The trimmed result is written back so storage doesn't grow unbounded.
 */
export async function getHistory(): Promise<HistoryEntry[]> {
  const result = await chrome.storage.local.get(HISTORY_KEY)
  const raw = result[HISTORY_KEY]
  const entries: HistoryEntry[] = Array.isArray(raw) ? raw : []

  const cutoff = Date.now() - THIRTY_DAYS_MS
  const trimmed = entries.filter((entry) => entry.timestamp >= cutoff)

  if (trimmed.length !== entries.length) {
    await chrome.storage.local.set({ [HISTORY_KEY]: trimmed })
  }

  return trimmed
}

export async function addHistoryEntry(entry: HistoryEntry): Promise<void> {
  const existing = await getHistory()
  const updated = [entry, ...existing]
  await chrome.storage.local.set({ [HISTORY_KEY]: updated })
}
