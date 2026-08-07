import { useCallback, useEffect, useState } from 'react'
import { getTheme, setTheme as persistTheme } from '../services/storageService'
import type { Theme } from '../types'

interface UseThemeResult {
  theme: Theme
  setTheme: (theme: Theme) => void
}

function applyThemeClass(theme: Theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const shouldBeDark = theme === 'dark' || (theme === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', shouldBeDark)
}

export function useTheme(): UseThemeResult {
  const [theme, setThemeState] = useState<Theme>('system')

  useEffect(() => {
    let cancelled = false

    async function load() {
      const stored = await getTheme()
      if (!cancelled) {
        setThemeState(stored)
        applyThemeClass(stored)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    applyThemeClass(newTheme)
    persistTheme(newTheme)
  }, [])

  return { theme, setTheme }
}
