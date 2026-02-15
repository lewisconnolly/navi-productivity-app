import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore, useThemeStore, useListStore, useActiveStore, useNotesStore } from '@/stores'
import { AuthGuard, AppShell } from '@/components/layout'
import { OfflineIndicator, UpdatePrompt } from '@/components/ui'
import { LoginPage, SignupPage } from '@/features/auth'
import { ListsPage } from '@/features/tasks'
import { ActiveListView } from '@/features/active'
import { NotesPage } from '@/features/notes'
import { usePWA } from '@/hooks'

function App() {
  const { initialize: initAuth, user, isLoading } = useAuthStore()
  const { initialize: initTheme } = useThemeStore()
  const { isOnline, needRefresh, dismissUpdate, applyUpdate } = usePWA()

  useEffect(() => {
    const unsubAuth = initAuth()
    const unsubTheme = initTheme()

    return () => {
      unsubAuth()
      unsubTheme()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <OfflineIndicator isOnline={isOnline} />
      <UpdatePrompt
        needRefresh={needRefresh}
        onDismiss={dismissUpdate}
        onUpdate={applyUpdate}
      />
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route
            path="/signup"
            element={user ? <Navigate to="/" replace /> : <SignupPage />}
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <AuthGuard>
                <AuthenticatedLayout />
              </AuthGuard>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="lists" element={<ListsPage />} />
            <Route path="notes" element={<NotesPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

// Subscribes to Firestore data and renders child routes via Outlet
function AuthenticatedLayout() {
  const { user } = useAuthStore()
  const { subscribe: subscribeLists } = useListStore()
  const { subscribe: subscribeActive } = useActiveStore()
  const { subscribe: subscribeNotes } = useNotesStore()

  useEffect(() => {
    if (!user) return

    const unsubLists = subscribeLists(user.uid)
    const unsubActive = subscribeActive(user.uid)
    const unsubNotes = subscribeNotes(user.uid)

    return () => {
      unsubLists()
      unsubActive()
      unsubNotes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return <Outlet />
}

function HomePage() {
  const { user } = useAuthStore()
  const { activeList, isLoading } = useActiveStore()

  return (
    <AppShell>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      ) : activeList ? (
        <ActiveListView activeList={activeList} />
      ) : (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-bg-tertiary flex items-center justify-center">
            <svg className="h-10 w-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Welcome to Navi</h2>
          <p className="text-text-muted mb-6">
            {user?.email}
          </p>
          <p className="text-text-secondary text-sm">
            No active list. Go to <span className="font-medium">Lists</span> to create and activate a task list.
          </p>
        </div>
      )}
    </AppShell>
  )
}

export default App
