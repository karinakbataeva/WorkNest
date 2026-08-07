import { useState } from 'react'
import { Save, Check, X } from 'lucide-react'
import type { Tab } from '../types'

interface SaveWorkspaceButtonProps {
  tabs: Tab[]
  onSave: (name: string, tabs: Tab[]) => Promise<void>
  isSaving: boolean
}

export function SaveWorkspaceButton({ tabs, onSave, isSaving }: SaveWorkspaceButtonProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')

  async function handleConfirm() {
    if (!name.trim()) return
    await onSave(name, tabs)
    setName('')
    setIsEditing(false)
  }

  function handleCancel() {
    setName('')
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1.5">
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleConfirm()
            if (e.key === 'Escape') handleCancel()
          }}
          placeholder="Workspace name…"
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={handleConfirm}
          disabled={isSaving || !name.trim()}
          className="rounded-md p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 disabled:opacity-40 transition-colors"
          aria-label="Confirm save"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      disabled={tabs.length === 0}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors"
    >
      <Save className="w-4 h-4" />
      Save as Workspace
    </button>
  )
}
