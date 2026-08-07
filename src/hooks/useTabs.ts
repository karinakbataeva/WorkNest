import { useCallback, useEffect, useState } from 'react'
import { getAllTabs, closeTab } from '../services'
import type { Tab } from '../types'

interface UseTabsResult {
  tabs: Tab[]
  isLoading: boolean
  error: string | null
  refresh: () => void
  closeTab: (tabId: number) => Promise<void>
}

export function useTabs(): UseTabsResult {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => {
    setRefreshKey((key) => key + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadTabs() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await getAllTabs()
        if (!cancelled) {
          setTabs(result)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load tabs')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadTabs()

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const handleCloseTab = useCallback(async (tabId: number) => {
    await closeTab(tabId)
    setTabs((prev) => prev.filter((tab) => tab.id !== tabId))
  }, [])

  return { tabs, isLoading, error, refresh, closeTab: handleCloseTab }
}
