import { useTabs } from '../hooks/useTabs'
import { TabList } from '../components/TabList'
import { LoadingState } from '../components/LoadingState'
import { EmptyState } from '../components/EmptyState'
import { ErrorState } from '../components/ErrorState'

export default function App() {
  const { tabs, isLoading, error, refresh } = useTabs()

  return (
    <div className="w-[360px] max-h-[600px] overflow-y-auto bg-white dark:bg-gray-900 p-2">
      {isLoading && <LoadingState />}
      {!isLoading && error && <ErrorState message={error} onRetry={refresh} />}
      {!isLoading && !error && tabs.length === 0 && <EmptyState />}
      {!isLoading && !error && tabs.length > 0 && <TabList tabs={tabs} />}
    </div>
  )
}
