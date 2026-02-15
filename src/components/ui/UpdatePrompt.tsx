import { Button } from './Button'

interface UpdatePromptProps {
  needRefresh: boolean
  onDismiss: () => void
  onUpdate: () => void
}

export function UpdatePrompt({ needRefresh, onDismiss, onUpdate }: UpdatePromptProps) {
  if (!needRefresh) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto">
      <div className="bg-bg-primary border border-border rounded-xl shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Update Available</h3>
            <p className="text-sm text-text-secondary mb-3">
              A new version of Navi is ready. Refresh to update.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                Later
              </Button>
              <Button size="sm" onClick={onUpdate}>
                Update Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
