import type { Task } from '@/types'
import { Checkbox } from '@/components/ui'

interface ActiveTaskItemProps {
  task: Task
  isCompleted: boolean
  onToggle: (completed: boolean) => void
}

export function ActiveTaskItem({ task, isCompleted, onToggle }: ActiveTaskItemProps) {
  return (
    <div
      className={`
        flex items-center gap-3 py-3 px-4 rounded-xl transition-all
        ${isCompleted
          ? 'bg-success/10 border border-success/20'
          : 'bg-bg-secondary border border-border'
        }
      `}
    >
      <Checkbox
        checked={isCompleted}
        onChange={(e) => onToggle(e.target.checked)}
      />
      <span
        className={`
          flex-1 transition-all
          ${isCompleted ? 'text-text-muted line-through' : ''}
        `}
      >
        {task.title}
      </span>
      {task.resetDaily && (
        <span className="text-xs text-text-muted" title="Resets daily">
          <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </span>
      )}
    </div>
  )
}
