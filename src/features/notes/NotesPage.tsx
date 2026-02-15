import { useState } from 'react'
import { useAuthStore, useNotesStore } from '@/stores'
import { AppShell } from '@/components/layout'
import { Button, Modal, toast } from '@/components/ui'
import type { Note, CreateNote } from '@/types'
import { NoteCard } from './NoteCard'
import { NoteForm } from './NoteForm'

export function NotesPage() {
  const { user } = useAuthStore()
  const { notes, isLoading, showArchived, createNote, updateNote, deleteNote, toggleArchive, setShowArchived } = useNotesStore()

  const [showCreate, setShowCreate] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  async function handleCreate(data: CreateNote) {
    if (!user) return
    try {
      await createNote(user.uid, data)
      toast.success('Note added!')
    } catch {
      toast.error('Failed to add note')
    }
  }

  async function handleUpdate(data: Partial<Note>) {
    if (!user || !editingNote) return
    try {
      await updateNote(user.uid, editingNote.id, data)
      toast.success('Note updated!')
    } catch {
      toast.error('Failed to update note')
    }
  }

  async function handleDelete() {
    if (!user || !editingNote) return
    try {
      await deleteNote(user.uid, editingNote.id)
      setEditingNote(null)
      toast.success('Note deleted')
    } catch {
      toast.error('Failed to delete note')
    }
  }

  async function handleArchive(noteId: string) {
    if (!user) return
    try {
      await toggleArchive(user.uid, noteId)
      const wasArchived = notes.find((n) => n.id === noteId)?.archived
      toast.success(wasArchived ? 'Note restored' : 'Note archived')
    } catch {
      toast.error('Failed to archive note')
    }
  }

  async function handleShare(note: Note) {
    let text = ''
    let url = ''

    switch (note.type) {
      case 'text':
        text = `${note.title}\n\n${note.content}`
        break
      case 'link':
        text = note.title || 'Check this out'
        url = note.url
        break
      case 'book':
        text = `${note.title} by ${note.author}`
        break
      case 'film':
        text = note.year ? `${note.title} (${note.year})` : note.title
        break
      case 'quote':
        text = `"${note.text}"${note.author ? ` — ${note.author}` : ''}`
        break
    }

    if (note.annotation) {
      text += `\n\nMy note: ${note.annotation}`
    }

    try {
      await navigator.share({ text, url: url || undefined })
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast.error('Failed to share')
      }
    }
  }

  // Re-calculate filtered notes
  const displayNotes = showArchived
    ? notes.filter((n) => n.archived)
    : notes.filter((n) => !n.archived)

  return (
    <AppShell title="Notes">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Archive toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`
                text-sm font-medium px-3 py-1.5 rounded-lg transition-colors
                ${showArchived
                  ? 'bg-warning/10 text-warning'
                  : 'text-text-muted hover:text-text-primary hover:bg-bg-tertiary'
                }
              `}
            >
              {showArchived ? 'Viewing Archived' : 'View Archived'}
            </button>
            <span className="text-sm text-text-muted">
              {displayNotes.length} note{displayNotes.length !== 1 ? 's' : ''}
            </span>
          </div>

          {displayNotes.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-tertiary flex items-center justify-center">
                <svg className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold mb-2">
                {showArchived ? 'No archived notes' : 'No notes yet'}
              </h2>
              <p className="text-text-muted mb-6">
                {showArchived
                  ? 'Notes you archive will appear here'
                  : 'Capture thoughts, links, books, and more'}
              </p>
              {!showArchived && (
                <Button onClick={() => setShowCreate(true)}>Add Note</Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {displayNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={setEditingNote}
                  onArchive={handleArchive}
                  onShare={handleShare}
                />
              ))}

              {!showArchived && (
                <Button
                  onClick={() => setShowCreate(true)}
                  variant="secondary"
                  className="w-full"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Note
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Create modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add Note"
        size="lg"
      >
        <NoteForm
          onSave={handleCreate}
          onClose={() => setShowCreate(false)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        title="Edit Note"
        size="lg"
      >
        {editingNote && (
          <NoteForm
            note={editingNote}
            onSave={(data) => handleUpdate(data as Partial<Note>)}
            onDelete={handleDelete}
            onClose={() => setEditingNote(null)}
          />
        )}
      </Modal>
    </AppShell>
  )
}
