import { useMemo, useState } from 'react'
import { useTabs } from '../hooks/useTabs'
import { useWorkspaces } from '../hooks/useWorkspaces'
import { useTheme } from '../hooks/useTheme'
import { useFocusSession } from '../hooks/useFocusSession'
import { TabList } from '../components/TabList'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { SaveWorkspaceButton } from '../components/SaveWorkspaceButton'
import { WorkspaceList } from '../components/WorkspaceList'
import { SearchInput } from '../components/SearchInput'
import { ThemeToggle } from '../components/ThemeToggle'
import { FocusSessionCard } from '../components/FocusSessionCard'

export default function App() {
  const { tabs, isLoading, error, refresh, closeTab } = useTabs()
  const { workspaces, saveWorkspace, isSaving, restore, rename, remove } = useWorkspaces()
  const { theme, setTheme } = useTheme()
  const { session, remainingSeconds, isActive, start, cancel } = useFocusSession()
  const [searchQuery, setSearchQuery] = useState('')

  const filteredWorkspaces = useMemo(() => {
    if (!searchQuery.trim()) return workspaces
    const query = searchQuery.trim().toLowerCase()
    return workspaces.filter((ws) => ws.name.toLowerCase().includes(query))
  }, [workspaces, searchQuery])

  return (
    <div className="w-[360px] max-h-[600px] overflow-y-auto bg-white dark:bg-gray-900">
      <header className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">WorkNest</h1>
        <ThemeToggle theme={theme} onChange={setTheme} />
      </header>

      <div className="p-2">
        <FocusSessionCard
          session={session}
          remainingSeconds={remainingSeconds}
          onStart={start}
          onCancel={cancel}
        />

        <SaveWorkspaceButton tabs={tabs} onSave={saveWorkspace} isSaving={isSaving} />

        {workspaces.length > 0 && (
          <div className="pt-1 pb-0.5">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search workspaces…"
            />
          </div>
        )}

        <WorkspaceList
          workspaces={filteredWorkspaces}
          focusActive={isActive}
          onRestore={restore}
          onRename={rename}
          onDelete={remove}
        />

        <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

        <p className="px-3 pt-1 pb-1 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Open Tabs
        </p>

        {isLoading && <LoadingState />}
        {!isLoading && error && <ErrorState message={error} onRetry={refresh} />}
        {!isLoading && !error && tabs.length === 0 && <EmptyState />}
        {!isLoading && !error && tabs.length > 0 && (
          <TabList tabs={tabs} onCloseTab={closeTab} />
        )}
      </div>
    </div>
  )
}
