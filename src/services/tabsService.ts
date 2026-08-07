import type { Tab } from '../types'

export async function getAllTabs(): Promise<Tab[]> {
  const chromeTabs = await chrome.tabs.query({})

  return chromeTabs
    .filter((tab): tab is chrome.tabs.Tab & { id: number } => tab.id !== undefined)
    .map((tab) => ({
      id: tab.id,
      windowId: tab.windowId,
      title: tab.title ?? 'Untitled',
      url: tab.url ?? '',
      favIconUrl: tab.favIconUrl,
      active: tab.active,
      pinned: tab.pinned,
      index: tab.index,
    }))
}

/**
 * Closes a single browser tab by id.
 */
export async function closeTab(tabId: number): Promise<void> {
  await chrome.tabs.remove(tabId)
}
