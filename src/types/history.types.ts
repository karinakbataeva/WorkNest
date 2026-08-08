export type HistoryAction = 'saved' | 'restored'

export interface HistoryEntry {
  id: string
  workspaceName: string
  action: HistoryAction
  timestamp: number
}
