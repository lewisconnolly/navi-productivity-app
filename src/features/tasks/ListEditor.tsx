import { useState, type FormEvent } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { TaskList, Task, CreateTask } from '@/types'
import { Button, Checkbox, Input, Modal } from '@/components/ui'
import { TaskItem } from './TaskItem'

interface ListEditorProps {
  list: TaskList
  isActive: boolean
  onUpdate: (data: Partial<TaskList>) => void
  onActivate: () => void
  onDeactivate: () => void
  onAddTask: (task: CreateTask) => void
  onUpdateTask: (taskId: string, data: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
  onDelete: () => void
  onClose: () => void
}

interface SortableTaskItemProps {
  task: Task
  onUpdate: (taskId: string, data: Partial<Task>) => void
  onDelete: (taskId: string) => void
}

function SortableTaskItem({ task, onUpdate, onDelete }: SortableTaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <TaskItem
        task={task}
        onUpdate={onUpdate}
        onDelete={onDelete}
        isEditing
        dragHandleListeners={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

const presetDurations = [1, 3, 7, 14, 30]

export function ListEditor({
  list,
  isActive,
  onUpdate,
  onActivate,
  onDeactivate,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onDelete,
  onClose,
}: ListEditorProps) {
  const [title, setTitle] = useState(list.title)
  const [durationInput, setDurationInput] = useState(list.duration.toString())
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  const sortedTasks = [...list.tasks].sort((a, b) => a.order - b.order)

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = sortedTasks.findIndex((t) => t.id === active.id)
    const newIdx = sortedTasks.findIndex((t) => t.id === over.id)
    const reordered = arrayMove(sortedTasks, oldIdx, newIdx).map((t, i) => ({ ...t, order: i }))
    onUpdate({ tasks: reordered })
  }

  function handleTitleBlur() {
    if (title.trim() && title !== list.title) {
      onUpdate({ title: title.trim() })
    } else {
      setTitle(list.title)
    }
  }

  function handleAddTask(e: FormEvent) {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    const newTask: CreateTask = {
      title: newTaskTitle.trim(),
      resetDaily: false,
      completed: false,
      order: list.tasks.length,
    }

    onAddTask(newTask)
    setNewTaskTitle('')
  }

  return (
    <div>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <Input
            label="List Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium mb-2">Duration (days)</label>
          <div className="flex gap-2 mb-2">
            {presetDurations.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => { onUpdate({ duration: d }); setDurationInput(d.toString()) }}
                className={`
                flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                ${list.duration === d
                    ? 'bg-primary text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:bg-border'
                  }
              `}
              >
                {d}
              </button>
            ))}
          </div>
          <Input
            type="number"
            value={durationInput}
            onChange={(e) => setDurationInput(e.target.value)}
            onBlur={(e) => {
              const val = Math.max(1, parseInt(e.target.value) || 1)
              setDurationInput(val.toString())
              onUpdate({ duration: val })
            }}
            min={1}
            placeholder="Custom days"
          />
        </div>

        {/* Tasks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Tasks</label>
            <span className="text-xs text-text-muted">
              <svg className="inline h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              = resets daily
            </span>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sortedTasks.map((task) => (
                  <SortableTaskItem
                    key={task.id}
                    task={task}
                    onUpdate={onUpdateTask}
                    onDelete={onDeleteTask}
                  />
                ))}

                {list.tasks.length === 0 && (
                  <p className="text-center text-text-muted py-4 text-sm">
                    No tasks yet. Add your first task below.
                  </p>
                )}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add task form */}
          <form onSubmit={handleAddTask} className="mt-3 flex gap-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a task..."
              className="flex-1"
            />
            <Button type="submit" disabled={!newTaskTitle.trim()}>
              Add
            </Button>
          </form>
        </div>

        {/* Active */}
        <div>
          <Checkbox
            label="Active"
            checked={isActive}
            disabled={!isActive && list.tasks.length === 0}
            onChange={(e) => e.target.checked ? onActivate() : onDeactivate()}
          />
          {!isActive && list.tasks.length === 0 && (
            <p className="text-xs text-text-muted mt-1 ml-7">Add at least one task to activate</p>
          )}
        </div>

      </div>

      {/* Actions — sticky at bottom of scroll container */}
      <div className="flex gap-2 pt-4 mt-6 border-t border-border sticky bottom-0 bg-bg-primary -mx-4 px-4 pb-1">
        <Button
          variant="danger"
          onClick={() => setShowDeleteConfirm(true)}
          className="flex-1"
        >
          Delete List
        </Button>
        <Button variant="secondary" onClick={onClose} className="flex-1">
          Done
        </Button>
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
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onDelete()
              setShowDeleteConfirm(false)
            }}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
