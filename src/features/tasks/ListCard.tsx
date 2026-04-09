import { useRef, useState } from 'react'
import type { TaskList } from '@/types'
import { Button, Card, Modal } from '@/components/ui'

interface ListCardProps {
  list: TaskList
  onEdit: (list: TaskList) => void
  onActivate: (list: TaskList) => void
  onDeactivate: () => void
  onDelete: (list: TaskList) => void
  isActive?: boolean
}

function formatDuration(days: number): string {
  if (days === 1) return '1 day'
  return `${days} days`
}

export function ListCard({ list, onEdit, onActivate, onDeactivate, onDelete, isActive }: ListCardProps) {
  const completedTasks = list.tasks.filter((t) => t.completed).length
  const totalTasks = list.tasks.length
  const [showContextMenu, setShowContextMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wasLongPress = useRef(false)

  function handlePointerDown() {
    wasLongPress.current = false
    longPressTimer.current = setTimeout(() => {
      wasLongPress.current = true
      setShowContextMenu(true)
    }, 500)
  }

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  function handleClick() {
    if (wasLongPress.current) return
    onEdit(list)
  }

  return (
    <>
      {/* Backdrop — captures taps outside the context menu */}
      {showContextMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowContextMenu(false)}
        />
      )}

      <div className="relative">
        <Card
          className={`cursor-pointer transition-all hover:border-primary/50 ${
            isActive ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerUp={cancelLongPress}
          onPointerLeave={cancelLongPress}
          onPointerCancel={cancelLongPress}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{list.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-text-muted">
                <span>{formatDuration(list.duration)}</span>
                <span>•</span>
                <span>{totalTasks} task{totalTasks !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {isActive ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeactivate()
                }}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-danger/10 text-danger transition-colors"
              >
                Deactivate
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onActivate(list)
                }}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors"
              >
                Activate
              </button>
            )}
          </div>

          {totalTasks > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                <span>Tasks</span>
                <span>{completedTasks}/{totalTasks}</span>
              </div>
              <div className="h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </Card>

        {/* Context menu popup */}
        {showContextMenu && (
          <div className="absolute top-2 left-2 z-50 min-w-44 bg-bg-secondary border border-border rounded-xl shadow-xl overflow-hidden">
            <button
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-danger hover:bg-danger/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                setShowContextMenu(false)
                setShowDeleteConfirm(true)
              }}
            >
              <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete List?"
        size="sm"
      >
        <p className="text-text-secondary mb-4">
          Are you sure you want to delete "{list.title}"? This action cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onDelete(list)
              setShowDeleteConfirm(false)
            }}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  )
}
