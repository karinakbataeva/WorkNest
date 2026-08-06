export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-gray-400 dark:text-gray-500">
      <p className="text-sm font-medium">No open tabs</p>
      <p className="text-xs">Tabs you open will show up here.</p>
    </div>
  )
}
