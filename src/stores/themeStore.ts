import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeMode } from '@/types'

interface ThemeState {
  mode: ThemeMode
  resolvedTheme: 'light' | 'dark'

  // Actions
  setMode: (mode: ThemeMode) => void
  initialize: () => () => void
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      resolvedTheme: getSystemTheme(),

      setMode: (mode) => {
        const resolvedTheme = mode === 'system' ? getSystemTheme() : mode
        applyTheme(resolvedTheme)
        set({ mode, resolvedTheme })
      },

      initialize: () => {
        // Apply initial theme
        const { mode } = get()
        const resolvedTheme = mode === 'system' ? getSystemTheme() : mode
        applyTheme(resolvedTheme)
        set({ resolvedTheme })

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = () => {
          const { mode } = get()
          if (mode === 'system') {
            const newTheme = getSystemTheme()
            applyTheme(newTheme)
            set({ resolvedTheme: newTheme })
          }
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
      },
    }),
    {
      name: 'navi-theme',
      partialize: (state) => ({ mode: state.mode }),
    }
  )
)
