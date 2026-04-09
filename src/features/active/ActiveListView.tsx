import { useEffect, useMemo, useState } from 'react'
import { Timestamp } from 'firebase/firestore'
import { useAuthStore, useListStore, useActiveStore } from '@/stores'
import { Button, Modal, toast } from '@/components/ui'
import type { ActiveList } from '@/types'
import { ActiveTaskItem } from './ActiveTaskItem'
import { ProgressRing } from './ProgressRing'

interface ActiveListViewProps {
  activeList: ActiveList
}

function getTodayDate(timezone?: string): string {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
}

function getDayNumber(activatedAt: Timestamp | Date): number {
  const activated = activatedAt instanceof Timestamp ? activatedAt.toDate() : activatedAt
  const now = new Date()
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((now.getTime() - activated.getTime()) / msPerDay) + 1
}

function isExpired(activatedAt: Timestamp | Date, duration: number): boolean {
  return getDayNumber(activatedAt) > duration
}

function getDateForDay(activatedAt: Timestamp | Date, dayNum: number): string {
  const activated = activatedAt instanceof Timestamp ? activatedAt.toDate() : activatedAt
  const date = new Date(activated)
  date.setDate(date.getDate() + dayNum - 1)
  return date.toLocaleDateString('en-CA')
}

export function ActiveListView({ activeList }: ActiveListViewProps) {
  const { user, preferences } = useAuthStore()
  const { lists, isLoading: listsLoading } = useListStore()
  const { toggleTaskCompletion, checkAndResetDailyTasks, deactivateList } = useActiveStore()
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const list = useMemo(() => {
    return lists.find((l) => l.id === activeList.listId)
  }, [lists, activeList.listId])

  const today = getTodayDate(preferences?.timezone)

  useEffect(() => {
    if (!user || !preferences) return
    checkAndResetDailyTasks(user.uid, preferences.timezone)
  }, [user, preferences, checkAndResetDailyTasks, today])

  // Auto-deactivate if the referenced list has been deleted
  useEffect(() => {
    if (!listsLoading && !list && user) {
      deactivateList(user.uid).catch(() => { })
    }
  }, [listsLoading, list, user, deactivateList])

  if (!list) return null

  const dayNumber = getDayNumber(activeList.activatedAt)
  const expired = isExpired(activeList.activatedAt, list.duration)

  // The day being viewed — defaults to today's day (capped at duration)
  const viewingDay = selectedDay ?? Math.min(dayNumber, list.duration)
  const viewingDate = getDateForDay(activeList.activatedAt, viewingDay)
  const isViewingToday = viewingDate === today

  function isTaskCompleted(taskId: string, resetDaily: boolean): boolean {
    const completions = activeList.taskCompletions[taskId] || []
    if (resetDaily) {
      return completions.some((c) => c.date === viewingDate)
    }
    return completions.length > 0
  }

  const completedCount = list.tasks.filter((task) =>
    isTaskCompleted(task.id, task.resetDaily)
  ).length
  const totalTasks = list.tasks.length
  const progress = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0

  async function handleToggle(taskId: string, completed: boolean) {
    if (!user) return
    try {
      await toggleTaskCompletion(user.uid, taskId, completed, viewingDate)
    } catch {
      toast.error('Failed to update task')
    }
  }

  async function handleDeactivate() {
    if (!user) return
    try {
      await deactivateList(user.uid)
      toast.success('List deactivated')
    } catch {
      toast.error('Failed to deactivate list')
    }
  }

  useEffect(() => {
    if (expired && !showCompleteModal) {
      setShowCompleteModal(true)
    }
  }, [expired, showCompleteModal])

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-1">{list.title}</h2>
        <p className="text-text-muted text-sm mb-6">
          Day {viewingDay} of {list.duration}
          {!isViewingToday && (
            <span className="ml-2 text-xs text-primary font-medium">
              (today is Day {Math.min(dayNumber, list.duration)})
            </span>
          )}
        </p>

        <ProgressRing progress={progress} />

        <p className="mt-4 text-text-secondary">
          {completedCount} of {totalTasks} tasks completed
          {isViewingToday ? ' today' : ` on Day ${viewingDay}`}
        </p>
      </div>

      {/* Day selector */}
      <div className="bg-bg-secondary rounded-xl p-4">
        <div className="flex justify-between text-xs text-text-muted mb-2">
          {Array.from({ length: list.duration }, (_, i) => {
            const day = i + 1
            const isToday = day === Math.min(dayNumber, list.duration) && today === getDateForDay(activeList.activatedAt, day)
            const isPast = day < dayNumber
            const isSelected = day === viewingDay

            let classes = 'w-8 h-8 rounded-full flex items-center justify-center font-medium cursor-pointer transition-all '

            if (isSelected && isToday) {
              classes += 'bg-primary text-white ring-2 ring-primary ring-offset-2 ring-offset-bg-secondary'
            } else if (isSelected && isPast) {
              classes += 'bg-primary/40 text-primary ring-2 ring-primary ring-offset-2 ring-offset-bg-secondary'
            } else if (isSelected) {
              // Future day selected
              classes += 'bg-bg-tertiary text-text-secondary ring-2 ring-primary ring-offset-2 ring-offset-bg-secondary'
            } else if (isToday) {
              classes += 'bg-primary text-white'
            } else if (isPast) {
              classes += 'bg-primary/20 text-primary'
            } else {
              classes += 'bg-bg-tertiary text-text-muted'
            }

            return (
              <span
                key={i}
                className={classes}
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </span>
            )
          })}
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-2">
        {list.tasks.map((task) => (
          <ActiveTaskItem
            key={task.id}
            task={task}
            isCompleted={isTaskCompleted(task.id, task.resetDaily)}
            onToggle={(completed) => handleToggle(task.id, completed)}
          />
        ))}
      </div>

      {/* Deactivate button */}
      <Button variant="ghost" onClick={handleDeactivate} className="w-full">
        Deactivate List
      </Button>

      {/* Completion modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title={expired ? 'List Complete!' : 'Great Progress!'}
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
            <svg className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {expired ? (
            <>
              <p className="text-text-secondary mb-4">
                You've completed your {list.duration}-day challenge with "{list.title}"!
              </p>
              <Button onClick={handleDeactivate} className="w-full">
                Finish
              </Button>
            </>
          ) : (
            <>
              <p className="text-text-secondary mb-4">
                All tasks completed for today! Keep up the great work.
              </p>
              <Button onClick={() => setShowCompleteModal(false)} className="w-full">
                Continue
              </Button>
            </>
          )}
        </div>
      </Modal>
    </div>
  )
}
