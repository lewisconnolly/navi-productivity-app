import { create } from 'zustand'
import { orderBy } from 'firebase/firestore'
import type { Note, CreateNote } from '@/types'
import {
  addUserDocument,
  updateUserDocument,
  deleteUserDocument,
  subscribeToUserCollection,
} from '@/services/firestore'

interface NotesState {
  notes: Note[]
  isLoading: boolean
  error: string | null
  showArchived: boolean

  // Actions
  subscribe: (userId: string) => () => void
  createNote: (userId: string, data: CreateNote) => Promise<string>
  updateNote: (userId: string, noteId: string, data: Partial<Note>) => Promise<void>
  deleteNote: (userId: string, noteId: string) => Promise<void>
  toggleArchive: (userId: string, noteId: string) => Promise<void>
  reorderNotes: (userId: string, notes: Note[]) => Promise<void>
  setShowArchived: (show: boolean) => void
  clearError: () => void
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  isLoading: true,
  error: null,
  showArchived: false,

  subscribe: (userId) => {
    set({ isLoading: true })
    const unsubscribe = subscribeToUserCollection(
      userId,
      'notes',
      (docs) => {
        const notes = docs as Note[]
        set({ notes, isLoading: false })
      },
      orderBy('order', 'asc')
    )
    return unsubscribe
  },

  createNote: async (userId, data) => {
    try {
      const { notes } = get()
      const maxOrder = notes.length > 0 ? Math.max(...notes.map((n) => n.order)) : -1

      const docRef = await addUserDocument(userId, 'notes', {
        ...data,
        archived: false,
        order: maxOrder + 1,
      })
      return docRef.id
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  updateNote: async (userId, noteId, data) => {
    try {
      await updateUserDocument(userId, 'notes', noteId, data)
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  deleteNote: async (userId, noteId) => {
    try {
      await deleteUserDocument(userId, 'notes', noteId)
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  toggleArchive: async (userId, noteId) => {
    const { notes } = get()
    const note = notes.find((n) => n.id === noteId)
    if (!note) return

    try {
      await updateUserDocument(userId, 'notes', noteId, {
        archived: !note.archived,
      })
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  reorderNotes: async (userId, notes) => {
    try {
      // Update each note with its new order
      const updates = notes.map((note, index) =>
        updateUserDocument(userId, 'notes', note.id, { order: index })
      )
      await Promise.all(updates)
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  setShowArchived: (show) => set({ showArchived: show }),

  clearError: () => set({ error: null }),
}))

// Selector to get filtered notes based on archive status
export const selectFilteredNotes = (state: NotesState) => {
  return state.showArchived
    ? state.notes.filter((n) => n.archived)
    : state.notes.filter((n) => !n.archived)
}
