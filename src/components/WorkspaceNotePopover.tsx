import { useEffect, useRef, useState } from 'react'
import { Pencil, StickyNote, Trash2 } from 'lucide-react'

interface WorkspaceNotePopoverProps {
  note: string | undefined
  onSave: (note: string) => void
  onDeleteNote: () => void
  onClose: () => void
}

export function WorkspaceNotePopover({
  note,
  onSave,
  onDeleteNote,
  onClose,
}: WorkspaceNotePopoverProps) {
  const [editing, setEditing] = useState(!note)
  const [draft, setDraft] = useState(note ?? '')
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  function handleSave() {
    onSave(draft)
    onClose()
  }

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full z-20 mt-1 w-72 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-2.5"
    >
      {editing ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <StickyNote className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Add note</p>
          </div>
          <textarea
            autoFocus
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose()
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSave()
            }}
            placeholder="What were you working on?"
            className="w-full resize-none rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 py-1.5 text-xs text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-1.5">
            <button
              onClick={onClose}
              className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-blue-600 hover:bg-blue-700 px-2 py-1 text-xs font-medium text-white transition-colors"
            >
              Save note
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Note</p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                onClick={() => setEditing(true)}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Edit note"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                onClick={() => {
                  onDeleteNote()
                  onClose()
                }}
                className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors"
                aria-label="Delete note"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          <p className="text-[15px] leading-snug font-medium text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{note}</p>
        </div>
      )}
    </div>
  )
}
