import { useState } from 'react'
import type { Task } from '@/types'
import { Checkbox, Input } from '@/components/ui'

interface TaskItemProps {
  task: Task
  onUpdate: (taskId: string, data: Partial<Task>) => void
  onDelete: (taskId: string) => void
  isEditing?: boolean
}

export function TaskItem({ task, onUpdate, onDelete, isEditing }: TaskItemProps) {
  const [editTitle, setEditTitle] = useState(task.title)
  const [isEditingTitle, setIsEditingTitle] = useState(false)

  function handleSaveTitle() {
    if (editTitle.trim() && editTitle !== task.title) {
      onUpdate(task.id, { title: editTitle.trim() })
    } else {
      setEditTitle(task.title)
    }
    setIsEditingTitle(false)
  }

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-bg-secondary group">
      {/* Drag handle - only shown when editing */}
      {isEditing && (
        <div className="cursor-grab text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      )}

      {/* Task content */}
      <div className="flex-1 min-w-0">
        {isEditingTitle ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle()
              if (e.key === 'Escape') {
                setEditTitle(task.title)
                setIsEditingTitle(false)
              }
            }}
            autoFocus
            className="py-1"
          />
        ) : (
          <span
            onClick={() => isEditing && setIsEditingTitle(true)}
            className={`block truncate ${isEditing ? 'cursor-text' : ''}`}
          >
            {task.title}
          </span>
        )}
      </div>

      {/* Reset daily toggle */}
      {isEditing && (
        <button
          onClick={() => onUpdate(task.id, { resetDaily: !task.resetDaily })}
          title={task.resetDaily ? 'Resets daily' : 'Does not reset'}
          className={`
            p-1.5 rounded-md transition-colors
            ${task.resetDaily
              ? 'text-primary bg-primary/10'
              : 'text-text-muted hover:text-text-secondary hover:bg-bg-tertiary'
            }
          `}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      )}

      {/* Delete button */}
      {isEditing && (
        <button
          onClick={() => onDelete(task.id)}
          className="p-1.5 rounded-md text-text-muted hover:text-danger hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

      {/* Checkbox - only when not editing */}
      {!isEditing && (
        <Checkbox
          checked={task.completed}
          onChange={(e) => onUpdate(task.id, { completed: e.target.checked })}
        />
      )}
    </div>
  )
}
