import { create } from 'zustand'
import type { User } from 'firebase/auth'
import type { UserPreferences } from '@/types'
import {
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  signOut as firebaseSignOut,
  subscribeToAuthState,
  getUserPreferences,
  updateUserPreferences,
} from '@/services/auth'

interface AuthState {
  user: User | null
  preferences: UserPreferences | null
  isLoading: boolean
  error: string | null

  // Actions
  initialize: () => () => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  preferences: null,
  isLoading: true,
  error: null,

  initialize: () => {
    const unsubscribe = subscribeToAuthState(async (user) => {
      if (user) {
        try {
          const preferences = await getUserPreferences(user.uid)
          set({ user, preferences, isLoading: false })
        } catch (error) {
          console.error('Failed to load user preferences:', error)
          set({ user, preferences: null, isLoading: false })
        }
      } else {
        set({ user: null, preferences: null, isLoading: false })
      }
    })
    return unsubscribe
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      await firebaseSignIn(email, password)
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  signUp: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      await firebaseSignUp(email, password)
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null })
    try {
      await firebaseSignOut()
      set({ user: null, preferences: null, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      throw error
    }
  },

  updatePreferences: async (newPreferences) => {
    const { user, preferences } = get()
    if (!user || !preferences) return

    try {
      await updateUserPreferences(user.uid, newPreferences)
      set({ preferences: { ...preferences, ...newPreferences } })
    } catch (error) {
      set({ error: (error as Error).message })
      throw error
    }
  },

  clearError: () => set({ error: null }),
}))
