import type { Tab } from './tab.types'

export interface Workspace {
  id: string
  name: string
  tabs: Tab[]
  note?: string
  createdAt: number
  updatedAt: number
}
