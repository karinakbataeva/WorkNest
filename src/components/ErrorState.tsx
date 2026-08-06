interface ErrorStateProps {
  message: string
  onRetry: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <p className="text-sm font-medium text-red-500 dark:text-red-400">
        Couldn't load tabs
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-md border border-gray-300 dark:border-gray-700 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        Retry
      </button>
    </div>
  )
}
