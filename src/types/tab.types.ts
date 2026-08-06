export interface Tab {
  id: number
  windowId: number
  title: string
  url: string
  favIconUrl?: string
  active: boolean
  pinned: boolean
  index: number
}
