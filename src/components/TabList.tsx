import type { Tab } from '../types'
import { TabItem } from './TabItem'

interface TabListProps {
  tabs: Tab[]
}

export function TabList({ tabs }: TabListProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {tabs.map((tab) => (
        <TabItem key={tab.id} tab={tab} />
      ))}
    </div>
  )
}
