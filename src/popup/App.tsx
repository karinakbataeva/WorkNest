import { useTabs } from '../hooks/useTabs'
import { useWorkspaces } from '../hooks/useWorkspaces'
import { TabList } from '../components/TabList'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'
import { SaveWorkspaceButton } from '../components/SaveWorkspaceButton'

export default function App() {
  const { tabs, isLoading, error, refresh } = useTabs()
  const { saveWorkspace, isSaving } = useWorkspaces()

  return (
    <div className="w-[360px] max-h-[600px] overflow-y-auto bg-white dark:bg-gray-900 p-2">
      <SaveWorkspaceButton tabs={tabs} onSave={saveWorkspace} isSaving={isSaving} />

      <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

      {isLoading && <LoadingState />}
      {!isLoading && error && <ErrorState message={error} onRetry={refresh} />}
      {!isLoading && !error && tabs.length === 0 && <EmptyState />}
      {!isLoading && !error && tabs.length > 0 && <TabList tabs={tabs} />}
    </div>
  )
}
