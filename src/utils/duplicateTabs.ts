import type { Tab } from '../types'

/**
 * Returns the set of tab IDs that are duplicates — i.e. tabs sharing a URL
 * with an earlier tab in the list. The first occurrence of each URL is
 * NOT included; only the later, redundant copies are flagged.
 */
export function getDuplicateTabIds(tabs: Tab[]): Set<number> {
  const seenUrls = new Set<string>()
  const duplicateIds = new Set<number>()

  for (const tab of tabs) {
    if (!tab.url) continue

    if (seenUrls.has(tab.url)) {
      duplicateIds.add(tab.id)
    } else {
      seenUrls.add(tab.url)
    }
  }

  return duplicateIds
}
