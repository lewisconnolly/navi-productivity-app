import { useState, type FormEvent, type KeyboardEvent } from 'react'
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
import type { Task } from '@/types'
import { Modal, Button, Input, Checkbox } from '@/components/ui'
import { TaskItem } from './TaskItem'

interface CreateListModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (title: string, duration: number, tasks: Task[], activate: boolean) => void
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

export function CreateListModal({ isOpen, onClose, onCreate }: CreateListModalProps) {
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState(7)
  const [durationInput, setDurationInput] = useState('7')
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [activate, setActivate] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setTasks((prev) => {
      const oldIdx = prev.findIndex((t) => t.id === active.id)
      const newIdx = prev.findIndex((t) => t.id === over.id)
      return arrayMove(prev, oldIdx, newIdx).map((t, i) => ({ ...t, order: i }))
    })
  }

  function handleAddTask() {
    if (!newTaskTitle.trim()) return
    setTasks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: newTaskTitle.trim(),
        resetDaily: false,
        completed: false,
        order: prev.length,
      },
    ])
    setNewTaskTitle('')
  }

  function handleTaskKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTask()
    }
  }

  function handleUpdateTask(taskId: string, data: Partial<Task>) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...data } : t)))
  }

  function handleDeleteTask(taskId: string) {
    setTasks((prev) => {
      const updated = prev.filter((t) => t.id !== taskId)
      if (updated.length === 0) setActivate(false)
      return updated
    })
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || duration < 1) return
    onCreate(title.trim(), duration, tasks, activate)
    setTitle('')
    setDuration(7)
    setDurationInput('7')
    setTasks([])
    setNewTaskTitle('')
    setActivate(false)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New List">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="List Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Morning Routine"
          autoFocus
        />

        <div>
          <label className="block text-sm font-medium mb-2">Duration (days)</label>
          <div className="flex gap-2 mb-2">
            {presetDurations.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => { setDuration(d); setDurationInput(d.toString()) }}
                className={`
                  flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                  ${duration === d
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
              setDuration(val)
              setDurationInput(val.toString())
            }}
            min={1}
            placeholder="Custom days"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">Tasks</label>
            {tasks.length > 0 && (
              <span className="text-xs text-text-muted">
                <svg className="inline h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                = resets daily
              </span>
            )}
          </div>

          {tasks.length > 0 && (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 mb-3">
                  {tasks.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      onUpdate={handleUpdateTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          <div className="flex gap-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleTaskKeyDown}
              placeholder="Add a task..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        <div className="py-1">
          <Checkbox
            label="Activate after creating"
            checked={activate}
            disabled={tasks.length === 0}
            onChange={(e) => setActivate(e.target.checked)}
          />
          {tasks.length === 0 && (
            <p className="text-xs text-text-muted mt-1 ml-7">Add at least one task to activate</p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim() || duration < 1} className="flex-1">
            Create
          </Button>
        </div>
      </form>
    </Modal>
  )
}
