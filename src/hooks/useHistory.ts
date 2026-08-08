import { useEffect, useState } from 'react'
import { getHistory } from '../services'
import type { HistoryEntry } from '../types'

interface UseHistoryResult {
  history: HistoryEntry[]
  isLoading: boolean
}

export function useHistory(isOpen: boolean): UseHistoryResult {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    setIsLoading(true)

    getHistory().then((result) => {
      if (!cancelled) {
        setHistory(result)
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [isOpen])

  return { history, isLoading }
}
