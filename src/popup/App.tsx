import { useMemo, useState } from 'react'
import { History } from 'lucide-react'
import { useTabs } from '../hooks/useTabs'
import { useWorkspaces } from '../hooks/useWorkspaces'
import { useTheme } from '../hooks/useTheme'
import { useFocusSession } from '../hooks/useFocusSession'
import { useHistory } from '../hooks/useHistory'
import { TabList } from '../components/TabList'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { SaveWorkspaceButton } from '../components/SaveWorkspaceButton'
import { WorkspaceList } from '../components/WorkspaceList'
import { SearchInput } from '../components/SearchInput'
import { ThemeToggle } from '../components/ThemeToggle'
import { FocusSessionCard } from '../components/FocusSessionCard'
import { HistoryView } from '../components/HistoryView'

export default function App() {
  const { tabs, isLoading, error, refresh, closeTab } = useTabs()
  const { workspaces, saveWorkspace, isSaving, restore, rename, remove } = useWorkspaces()
  const { theme, setTheme } = useTheme()
  const { session, remainingSeconds, isActive, start, cancel } = useFocusSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState<'main' | 'history'>('main')
  const { history, isLoading: historyLoading } = useHistory(view === 'history')

  const filteredWorkspaces = useMemo(() => {
    if (!searchQuery.trim()) return workspaces
    const query = searchQuery.trim().toLowerCase()
    return workspaces.filter((ws) => ws.name.toLowerCase().includes(query))
  }, [workspaces, searchQuery])

  if (view === 'history') {
    return (
      <HistoryView history={history} isLoading={historyLoading} onBack={() => setView('main')} />
    )
  }

  return (
    <div className="w-[360px] h-[600px] overflow-y-auto bg-white dark:bg-gray-900">
      <header className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100">WorkNest</h1>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setView('history')}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="View history"
          >
            <History className="w-4 h-4" />
          </button>
          <ThemeToggle theme={theme} onChange={setTheme} />
        </div>
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
