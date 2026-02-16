import { create } from 'zustand'
import { Timestamp } from 'firebase/firestore'
import type { ActiveList, TaskList, TaskCompletion } from '@/types'
import {
  setUserDocument,
  updateUserDocument,
  deleteUserDocument,
  subscribeToUserDocument,
} from '@/services/firestore'

interface ActiveState {
  activeList: ActiveList | null
  isLoading: boolean
  error: string | null

  // Actions
  subscribe: (userId: string) => () => void
  activateList: (userId: string, list: TaskList) => Promise<void>
  deactivateList: (userId: string) => Promise<void>
  toggleTaskCompletion: (userId: string, taskId: string, completed: boolean) => Promise<void>
  checkAndResetDailyTasks: (userId: string, timezone: string) => Promise<boolean>
  getProgress: () => { completed: number; total: number; percentage: number }
  getDayProgress: () => { currentDay: number; totalDays: number }
  clearError: () => void
}

// Get today's date in YYYY-MM-DD format for a given timezone
function getTodayDate(timezone: string): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: timezone })
}

// Check if the list duration has expired
function isListExpired(activatedAt: Timestamp | Date, duration: number): boolean {
  const activated = activatedAt instanceof Timestamp ? activatedAt.toDate() : activatedAt
  const expiresAt = new Date(activated.getTime() + duration * 24 * 60 * 60 * 1000)
  return new Date() >= expiresAt
}

export const useActiveStore = create<ActiveState>((set, get) => ({
  activeList: null,
  isLoading: true,
  error: null,

  subscribe: (userId) => {
    set({ isLoading: true })
    const unsubscribe = subscribeToUserDocument(
      userId,
      'active',
      'current',
      (doc) => {
        set({ activeList: doc as ActiveList | null, isLoading: false })
      }
    )
    return unsubscribe
  },

  activateList: async (userId, list) => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const today = getTodayDate(timezone)

      const activeData: Omit<ActiveList, 'id'> = {
        listId: list.id,
        listTitle: list.title,
        activatedAt: Timestamp.now(),
        taskCompletions: {},
        lastResetDate: today,
      }

      // Set the active list document with the specific ID 'current'
      await setUserDocument(userId, 'active', 'current', activeData)
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  deactivateList: async (userId) => {
    try {
      await deleteUserDocument(userId, 'active', 'current')
      set({ activeList: null })
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  toggleTaskCompletion: async (userId, taskId, completed) => {
    const { activeList } = get()
    if (!activeList) return

    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const today = getTodayDate(timezone)
      const completions = activeList.taskCompletions[taskId] || []

      let updatedCompletions: TaskCompletion[]
      if (completed) {
        // Add completion for today
        updatedCompletions = [
          ...completions,
          { completedAt: Timestamp.now(), date: today },
        ]
      } else {
        // Remove today's completion
        updatedCompletions = completions.filter((c) => c.date !== today)
      }

      await updateUserDocument(userId, 'active', 'current', {
        taskCompletions: {
          ...activeList.taskCompletions,
          [taskId]: updatedCompletions,
        },
      })
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  checkAndResetDailyTasks: async (userId, timezone) => {
    const { activeList } = get()
    if (!activeList) return false

    const today = getTodayDate(timezone)
    if (activeList.lastResetDate === today) return false

    // Update the last reset date (daily tasks are "reset" by checking today's date)
    try {
      await updateUserDocument(userId, 'active', 'current', {
        lastResetDate: today,
      })
      return true
    } catch (error) {
      set({ error: (error as Error).message })
      return false
    }
  },

  getProgress: () => {
    const { activeList } = get()
    if (!activeList) return { completed: 0, total: 0, percentage: 0 }

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const today = getTodayDate(timezone)

    // This needs the actual tasks from the list store
    // For now, count based on taskCompletions
    const completedToday = Object.values(activeList.taskCompletions).filter(
      (completions) => completions.some((c) => c.date === today)
    ).length

    const total = Object.keys(activeList.taskCompletions).length || 1
    return {
      completed: completedToday,
      total,
      percentage: Math.round((completedToday / total) * 100),
    }
  },

  getDayProgress: () => {
    const { activeList } = get()
    if (!activeList) return { currentDay: 0, totalDays: 0 }

    const activated = activeList.activatedAt instanceof Timestamp
      ? activeList.activatedAt.toDate()
      : activeList.activatedAt

    const msPerDay = 24 * 60 * 60 * 1000
    const daysPassed = Math.floor((Date.now() - activated.getTime()) / msPerDay)
    const currentDay = Math.min(daysPassed + 1, 7) // Cap at 7 days

    return { currentDay, totalDays: 7 } // Duration comes from the list
  },

  clearError: () => set({ error: null }),
}))

export { isListExpired }
