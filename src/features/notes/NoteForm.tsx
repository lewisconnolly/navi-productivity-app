import { useState, type FormEvent, type ReactNode } from 'react'
import type { Note, NoteType, CreateNote } from '@/types'
import { Button, Input, Textarea, Modal } from '@/components/ui'

interface NoteFormProps {
  note?: Note
  onSave: (data: CreateNote) => void
  onDelete?: () => void
  onClose: () => void
}

const noteTypes: { value: NoteType; label: string; icon: ReactNode }[] = [
  {
    value: 'text',
    label: 'Text',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    value: 'link',
    label: 'Link',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
  },
  {
    value: 'book',
    label: 'Book',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    value: 'film',
    label: 'Film',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    value: 'quote',
    label: 'Quote',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
]

export function NoteForm({ note, onSave, onDelete, onClose }: NoteFormProps) {
  const [type, setType] = useState<NoteType>(note?.type || 'text')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Form fields
  const [title, setTitle] = useState(() => {
    if (!note) return ''
    if (note.type === 'text') return note.title
    if (note.type === 'link') return note.title || ''
    if (note.type === 'book') return note.title
    if (note.type === 'film') return note.title
    return ''
  })
  const [content, setContent] = useState(note?.type === 'text' ? note.content : '')
  const [url, setUrl] = useState(note?.type === 'link' ? note.url : '')
  const [author, setAuthor] = useState(() => {
    if (!note) return ''
    if (note.type === 'book') return note.author
    if (note.type === 'quote') return note.author || ''
    return ''
  })
  const [year, setYear] = useState(note?.type === 'film' ? note.year?.toString() || '' : '')
  const [quoteText, setQuoteText] = useState(note?.type === 'quote' ? note.text : '')
  const [source, setSource] = useState(note?.type === 'quote' ? note.source || '' : '')
  const [annotation, setAnnotation] = useState(note?.annotation || '')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    let data: CreateNote

    switch (type) {
      case 'text':
        if (!title.trim() || !content.trim()) return
        data = { type: 'text', title: title.trim(), content: content.trim(), annotation: annotation.trim() || undefined }
        break
      case 'link':
        if (!url.trim()) return
        data = { type: 'link', url: url.trim(), title: title.trim() || undefined, annotation: annotation.trim() || undefined }
        break
      case 'book':
        if (!title.trim() || !author.trim()) return
        data = { type: 'book', title: title.trim(), author: author.trim(), annotation: annotation.trim() || undefined }
        break
      case 'film':
        if (!title.trim()) return
        data = { type: 'film', title: title.trim(), year: year ? parseInt(year) : undefined, annotation: annotation.trim() || undefined }
        break
      case 'quote':
        if (!quoteText.trim()) return
        data = { type: 'quote', text: quoteText.trim(), author: author.trim() || undefined, source: source.trim() || undefined, annotation: annotation.trim() || undefined }
        break
    }

    onSave(data)
    onClose()
  }

  const isValid = () => {
    switch (type) {
      case 'text':
        return title.trim() && content.trim()
      case 'link':
        return url.trim()
      case 'book':
        return title.trim() && author.trim()
      case 'film':
        return title.trim()
      case 'quote':
        return quoteText.trim()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type selector (only for new notes) */}
      {!note && (
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <div className="flex gap-2">
            {noteTypes.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`
                  flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-lg transition-colors
                  ${type === value
                    ? 'bg-primary text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:bg-border'
                  }
                `}
              >
                {icon}
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Type-specific fields */}
      {type === 'text' && (
        <>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            autoFocus
          />
          <Textarea
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note..."
            rows={4}
          />
        </>
      )}

      {type === 'link' && (
        <>
          <Input
            label="URL"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            autoFocus
          />
          <Input
            label="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Link title"
          />
        </>
      )}

      {type === 'book' && (
        <>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Book title"
            autoFocus
          />
          <Input
            label="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author name"
          />
        </>
      )}

      {type === 'film' && (
        <>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Film title"
            autoFocus
          />
          <Input
            label="Year (optional)"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="2024"
            min="1800"
            max="2100"
          />
        </>
      )}

      {type === 'quote' && (
        <>
          <Textarea
            label="Quote"
            value={quoteText}
            onChange={(e) => setQuoteText(e.target.value)}
            placeholder="Enter the quote..."
            rows={3}
            autoFocus
          />
          <Input
            label="Author (optional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Who said this?"
          />
          <Input
            label="Source (optional)"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Book, movie, etc."
          />
        </>
      )}

      {/* Annotation (common to all types) */}
      <Textarea
        label="Personal Note (optional)"
        value={annotation}
        onChange={(e) => setAnnotation(e.target.value)}
        placeholder="Add your thoughts..."
        rows={2}
      />

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {note && onDelete && (
          <Button
            type="button"
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete
          </Button>
        )}
        <div className="flex-1" />
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid()}>
          {note ? 'Save' : 'Add'}
        </Button>
      </div>

      {/* Delete confirmation */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Note?"
        size="sm"
      >
        <p className="text-text-secondary mb-4">
          Are you sure you want to delete this note? This cannot be undone.
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onDelete?.()
              setShowDeleteConfirm(false)
              onClose()
            }}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </Modal>
    </form>
  )
}
