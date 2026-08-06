import type { Tab } from './tab.types'

export interface Workspace {
  id: string
  name: string
  tabs: Tab[]
  createdAt: number
  updatedAt: number
}
