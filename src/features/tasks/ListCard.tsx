import type { TaskList } from '@/types'
import { Card } from '@/components/ui'

interface ListCardProps {
  list: TaskList
  onEdit: (list: TaskList) => void
  onActivate: (list: TaskList) => void
  isActive?: boolean
}

function formatDuration(days: number): string {
  if (days === 1) return '1 day'
  return `${days} days`
}

export function ListCard({ list, onEdit, onActivate, isActive }: ListCardProps) {
  const completedTasks = list.tasks.filter((t) => t.completed).length
  const totalTasks = list.tasks.length

  return (
    <Card
      className={`cursor-pointer transition-all hover:border-primary/50 ${
        isActive ? 'border-primary bg-primary/5' : ''
      }`}
      onClick={() => onEdit(list)}
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
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
            Active
          </span>
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
  )
}
