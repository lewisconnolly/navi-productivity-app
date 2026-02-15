import { useEffect, useMemo } from 'react'
import { Timestamp } from 'firebase/firestore'
import { useAuthStore, useListStore, useActiveStore } from '@/stores'
import { Button, Modal, toast } from '@/components/ui'
import type { ActiveList } from '@/types'
import { ActiveTaskItem } from './ActiveTaskItem'
import { ProgressRing } from './ProgressRing'
import { useState } from 'react'

interface ActiveListViewProps {
  activeList: ActiveList
}

// Get today's date in YYYY-MM-DD format
function getTodayDate(timezone?: string): string {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
}

// Calculate day number
function getDayNumber(activatedAt: Timestamp | Date): number {
  const activated = activatedAt instanceof Timestamp ? activatedAt.toDate() : activatedAt
  const now = new Date()
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.floor((now.getTime() - activated.getTime()) / msPerDay) + 1
}

// Check if list has expired
function isExpired(activatedAt: Timestamp | Date, duration: number): boolean {
  const dayNumber = getDayNumber(activatedAt)
  return dayNumber > duration
}

export function ActiveListView({ activeList }: ActiveListViewProps) {
  const { user, preferences } = useAuthStore()
  const { lists } = useListStore()
  const { toggleTaskCompletion, checkAndResetDailyTasks, deactivateList } = useActiveStore()
  const [showCompleteModal, setShowCompleteModal] = useState(false)

  // Get the actual list data
  const list = useMemo(() => {
    return lists.find((l) => l.id === activeList.listId)
  }, [lists, activeList.listId])

  const today = getTodayDate(preferences?.timezone)

  // Check for daily reset on mount and when day changes
  useEffect(() => {
    if (!user || !preferences) return
    checkAndResetDailyTasks(user.uid, preferences.timezone)
  }, [user, preferences, checkAndResetDailyTasks, today])

  if (!list) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted">List not found</p>
      </div>
    )
  }

  const dayNumber = getDayNumber(activeList.activatedAt)
  const expired = isExpired(activeList.activatedAt, list.duration)

  // Calculate completion for today
  const completedToday = list.tasks.filter((task) => {
    const completions = activeList.taskCompletions[task.id] || []
    // For daily reset tasks, only count today's completion
    // For non-reset tasks, count if completed at any time
    if (task.resetDaily) {
      return completions.some((c) => c.date === today)
    }
    return completions.length > 0
  }).length

  const totalTasks = list.tasks.length
  const progress = totalTasks > 0 ? (completedToday / totalTasks) * 100 : 0

  // Check if task is completed for today
  function isTaskCompleted(taskId: string, resetDaily: boolean): boolean {
    const completions = activeList.taskCompletions[taskId] || []
    if (resetDaily) {
      return completions.some((c) => c.date === today)
    }
    return completions.length > 0
  }

  async function handleToggle(taskId: string, completed: boolean) {
    if (!user) return
    try {
      await toggleTaskCompletion(user.uid, taskId, completed)
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

  // Show completion modal when all tasks are done or list expired
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
          Day {Math.min(dayNumber, list.duration)} of {list.duration}
        </p>

        <ProgressRing progress={progress} />

        <p className="mt-4 text-text-secondary">
          {completedToday} of {totalTasks} tasks completed today
        </p>
      </div>

      {/* Day progress bar */}
      <div className="bg-bg-secondary rounded-xl p-4">
        <div className="flex justify-between text-xs text-text-muted mb-2">
          {Array.from({ length: list.duration }, (_, i) => (
            <span
              key={i}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center font-medium
                ${i + 1 < dayNumber
                  ? 'bg-primary text-white'
                  : i + 1 === dayNumber
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-bg-tertiary'
                }
              `}
            >
              {i + 1}
            </span>
          ))}
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
        Stop List
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
