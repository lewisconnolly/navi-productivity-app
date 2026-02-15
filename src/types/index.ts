import type { Timestamp } from 'firebase/firestore'

// ============================================
// Task & List Types
// ============================================

export interface Task {
  id: string
  title: string
  resetDaily: boolean
  completed: boolean
  order: number
}

export interface TaskList {
  id: string
  title: string
  duration: number // days
  tasks: Task[]
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

// Tracks completion state for a task on a specific date
export interface TaskCompletion {
  completedAt: Timestamp | Date
  date: string // YYYY-MM-DD format for easy comparison
}

export interface ActiveList {
  id: string
  listId: string
  listTitle: string
  activatedAt: Timestamp | Date
  // Map of taskId -> array of completions (for daily reset tasks, tracks each day)
  taskCompletions: Record<string, TaskCompletion[]>
  // Track the last reset date to know when to reset daily tasks
  lastResetDate: string // YYYY-MM-DD
}

// ============================================
// Note Types
// ============================================

export type NoteType = 'text' | 'link' | 'book' | 'film' | 'quote'

export interface BaseNote {
  id: string
  type: NoteType
  annotation?: string
  archived: boolean
  order: number
  createdAt: Timestamp | Date
  updatedAt: Timestamp | Date
}

export interface TextNote extends BaseNote {
  type: 'text'
  title: string
  content: string
}

export interface LinkNote extends BaseNote {
  type: 'link'
  url: string
  title?: string
  description?: string
  image?: string
}

export interface BookNote extends BaseNote {
  type: 'book'
  title: string
  author: string
}

export interface FilmNote extends BaseNote {
  type: 'film'
  title: string
  year?: number
}

export interface QuoteNote extends BaseNote {
  type: 'quote'
  text: string
  author?: string
  source?: string
}

export type Note = TextNote | LinkNote | BookNote | FilmNote | QuoteNote

// ============================================
// User Preferences
// ============================================

export type ThemeMode = 'light' | 'dark' | 'system'

export interface UserPreferences {
  theme: ThemeMode
  resetTime: string // HH:mm format
  timezone: string
}

export interface UserProfile {
  id: string
  email: string
  createdAt: Timestamp | Date
  preferences: UserPreferences
}

// ============================================
// Helper types for creating/updating
// ============================================

export type CreateTask = Omit<Task, 'id'>
export type CreateTaskList = Omit<TaskList, 'id' | 'createdAt' | 'updatedAt'>

// CreateNote types for each note type
export type CreateTextNote = Omit<TextNote, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'archived'>
export type CreateLinkNote = Omit<LinkNote, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'archived'>
export type CreateBookNote = Omit<BookNote, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'archived'>
export type CreateFilmNote = Omit<FilmNote, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'archived'>
export type CreateQuoteNote = Omit<QuoteNote, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'archived'>
export type CreateNote = CreateTextNote | CreateLinkNote | CreateBookNote | CreateFilmNote | CreateQuoteNote
