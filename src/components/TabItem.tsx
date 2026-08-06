import { Pin } from 'lucide-react'
import type { Tab } from '../types'

interface TabItemProps {
  tab: Tab
}

export function TabItem({ tab }: TabItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      {tab.favIconUrl ? (
        <img
          src={tab.favIconUrl}
          alt=""
          className="w-4 h-4 shrink-0 rounded-sm"
          onError={(e) => {
            e.currentTarget.style.visibility = 'hidden'
          }}
        />
      ) : (
        <div className="w-4 h-4 shrink-0 rounded-sm bg-gray-200 dark:bg-gray-700" />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
          {tab.title}
        </p>
        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
          {tab.url}
        </p>
      </div>

      {tab.pinned && (
        <Pin className="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gray-500" />
      )}
    </div>
  )
}
