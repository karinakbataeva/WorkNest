export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-400 dark:text-gray-500">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      <p className="text-sm">Loading tabs…</p>
    </div>
  )
}
