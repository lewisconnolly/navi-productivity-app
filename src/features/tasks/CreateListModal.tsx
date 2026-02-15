import { useState, type FormEvent } from 'react'
import { Modal, Button, Input } from '@/components/ui'

interface CreateListModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (title: string, duration: number) => void
}

const presetDurations = [1, 3, 7, 14, 30]

export function CreateListModal({ isOpen, onClose, onCreate }: CreateListModalProps) {
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState(7)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || duration < 1) return

    onCreate(title.trim(), duration)
    setTitle('')
    setDuration(7)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New List">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="List Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Morning Routine"
          autoFocus
        />

        <div>
          <label className="block text-sm font-medium mb-2">Duration (days)</label>
          <div className="flex gap-2 mb-2">
            {presetDurations.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`
                  flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                  ${duration === d
                    ? 'bg-primary text-white'
                    : 'bg-bg-tertiary text-text-secondary hover:bg-border'
                  }
                `}
              >
                {d}
              </button>
            ))}
          </div>
          <Input
            type="number"
            value={duration.toString()}
            onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
            min={1}
            placeholder="Custom days"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim() || duration < 1} className="flex-1">
            Create
          </Button>
        </div>
      </form>
    </Modal>
  )
}
