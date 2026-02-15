import { create } from 'zustand'
import { orderBy } from 'firebase/firestore'
import type { TaskList, CreateTaskList, Task, CreateTask } from '@/types'
import {
  addUserDocument,
  updateUserDocument,
  deleteUserDocument,
  subscribeToUserCollection,
} from '@/services/firestore'

interface ListState {
  lists: TaskList[]
  isLoading: boolean
  error: string | null

  // Actions
  subscribe: (userId: string) => () => void
  createList: (userId: string, data: CreateTaskList) => Promise<string>
  updateList: (userId: string, listId: string, data: Partial<TaskList>) => Promise<void>
  deleteList: (userId: string, listId: string) => Promise<void>
  addTask: (userId: string, listId: string, task: CreateTask) => Promise<void>
  updateTask: (userId: string, listId: string, taskId: string, data: Partial<Task>) => Promise<void>
  deleteTask: (userId: string, listId: string, taskId: string) => Promise<void>
  reorderTasks: (userId: string, listId: string, tasks: Task[]) => Promise<void>
  clearError: () => void
}

export const useListStore = create<ListState>((set, get) => ({
  lists: [],
  isLoading: true,
  error: null,

  subscribe: (userId) => {
    set({ isLoading: true })
    const unsubscribe = subscribeToUserCollection(
      userId,
      'lists',
      (docs) => {
        const lists = docs as TaskList[]
        set({ lists, isLoading: false })
      },
      orderBy('createdAt', 'desc')
    )
    return unsubscribe
  },

  createList: async (userId, data) => {
    try {
      const docRef = await addUserDocument(userId, 'lists', {
        ...data,
        tasks: data.tasks || [],
      })
      return docRef.id
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  updateList: async (userId, listId, data) => {
    try {
      await updateUserDocument(userId, 'lists', listId, data)
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  deleteList: async (userId, listId) => {
    try {
      await deleteUserDocument(userId, 'lists', listId)
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  addTask: async (userId, listId, task) => {
    const { lists } = get()
    const list = lists.find((l) => l.id === listId)
    if (!list) return

    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
    }

    const updatedTasks = [...list.tasks, newTask]
    await get().updateList(userId, listId, { tasks: updatedTasks })
  },

  updateTask: async (userId, listId, taskId, data) => {
    const { lists } = get()
    const list = lists.find((l) => l.id === listId)
    if (!list) return

    const updatedTasks = list.tasks.map((task) =>
      task.id === taskId ? { ...task, ...data } : task
    )
    await get().updateList(userId, listId, { tasks: updatedTasks })
  },

  deleteTask: async (userId, listId, taskId) => {
    const { lists } = get()
    const list = lists.find((l) => l.id === listId)
    if (!list) return

    const updatedTasks = list.tasks.filter((task) => task.id !== taskId)
    await get().updateList(userId, listId, { tasks: updatedTasks })
  },

  reorderTasks: async (userId, listId, tasks) => {
    const reorderedTasks = tasks.map((task, index) => ({
      ...task,
      order: index,
    }))
    await get().updateList(userId, listId, { tasks: reorderedTasks })
  },

  clearError: () => set({ error: null }),
}))
