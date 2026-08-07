import { useMemo } from 'react'
import type { Tab } from '../types'
import { getDuplicateTabIds } from '../utils/duplicateTabs'
import { TabItem } from './TabItem'

interface TabListProps {
  tabs: Tab[]
  onCloseTab?: (tabId: number) => void
}

export function TabList({ tabs, onCloseTab }: TabListProps) {
  const duplicateIds = useMemo(() => getDuplicateTabIds(tabs), [tabs])

  return (
    <div className="flex flex-col gap-0.5">
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isDuplicate={duplicateIds.has(tab.id)}
          onClose={onCloseTab}
        />
      ))}
    </div>
  )
}
