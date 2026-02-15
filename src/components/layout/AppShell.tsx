import type { ReactNode } from 'react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { ToastContainer } from '@/components/ui'

interface AppShellProps {
  children: ReactNode
  title?: string
  showBack?: boolean
  onBack?: () => void
  hideNav?: boolean
}

export function AppShell({ children, title, showBack, onBack, hideNav }: AppShellProps) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Header title={title} showBack={showBack} onBack={onBack} />
      <main className={`max-w-lg mx-auto px-4 py-4 ${hideNav ? '' : 'pb-20'}`}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
      <ToastContainer />
    </div>
  )
}
