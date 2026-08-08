import type { HistoryAction, HistoryEntry } from '../types'
import { addHistoryEntry, getHistory } from './storageService'

export async function logHistoryEvent(
  workspaceName: string,
  action: HistoryAction
): Promise<void> {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    workspaceName,
    action,
    timestamp: Date.now(),
  }
  await addHistoryEntry(entry)
}

export { getHistory }
