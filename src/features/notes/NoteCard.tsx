import type { ReactNode } from 'react'
import type { Note } from '@/types'
import { Card } from '@/components/ui'

interface NoteCardProps {
  note: Note
  onEdit: (note: Note) => void
  onArchive: (noteId: string) => void
  onShare?: (note: Note) => void
}

const typeIcons: Record<Note['type'], ReactNode> = {
  text: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  link: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  book: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  film: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
    </svg>
  ),
  quote: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
}

function getNoteTitle(note: Note): string {
  switch (note.type) {
    case 'text':
      return note.title
    case 'link':
      return note.title || note.url
    case 'book':
      return note.title
    case 'film':
      return note.title
    case 'quote':
      return note.text.slice(0, 50) + (note.text.length > 50 ? '...' : '')
  }
}

function getNoteSubtitle(note: Note): string | null {
  switch (note.type) {
    case 'text':
      return note.content.slice(0, 100) + (note.content.length > 100 ? '...' : '')
    case 'link':
      return note.description || null
    case 'book':
      return `by ${note.author}`
    case 'film':
      return note.year ? `(${note.year})` : null
    case 'quote':
      return note.author ? `— ${note.author}` : null
  }
}

export function NoteCard({ note, onEdit, onArchive, onShare }: NoteCardProps) {
  const title = getNoteTitle(note)
  const subtitle = getNoteSubtitle(note)

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-all"
      onClick={() => onEdit(note)}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-bg-tertiary flex items-center justify-center text-text-muted">
          {typeIcons[note.type]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{title}</h3>
          {subtitle && (
            <p className="text-sm text-text-muted truncate mt-0.5">{subtitle}</p>
          )}
          {note.annotation && (
            <p className="text-sm text-text-secondary mt-2 italic">
              "{note.annotation}"
            </p>
          )}
        </div>
        <div className="flex-shrink-0 flex items-start gap-1">
          {onShare && typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onShare(note)
              }}
              className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
              title="Share"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onArchive(note.id)
            }}
            className="p-1.5 rounded-md text-text-muted hover:text-warning hover:bg-warning/10 transition-colors"
            title={note.archived ? 'Unarchive' : 'Archive'}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </button>
        </div>
      </div>
    </Card>
  )
}
