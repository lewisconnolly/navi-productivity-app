import { useState } from 'react'
import { useAuthStore, useListStore, useActiveStore } from '@/stores'
import { AppShell } from '@/components/layout'
import { Button, Modal, toast } from '@/components/ui'
import type { TaskList, CreateTask, Task } from '@/types'
import { ListCard } from './ListCard'
import { CreateListModal } from './CreateListModal'
import { ListEditor } from './ListEditor'

export function ListsPage() {
  const { user } = useAuthStore()
  const { lists, isLoading, createList, updateList, deleteList, addTask, updateTask, deleteTask } = useListStore()
  const { activeList, activateList } = useActiveStore()

  const [showCreate, setShowCreate] = useState(false)
  const [editingList, setEditingList] = useState<TaskList | null>(null)

  async function handleCreate(title: string, duration: number) {
    if (!user) return
    try {
      await createList(user.uid, { title, duration, tasks: [] })
      toast.success('List created!')
    } catch {
      toast.error('Failed to create list')
    }
  }

  async function handleUpdate(data: Partial<TaskList>) {
    if (!user || !editingList) return
    try {
      await updateList(user.uid, editingList.id, data)
      // Update local state to reflect changes
      setEditingList({ ...editingList, ...data })
    } catch {
      toast.error('Failed to update list')
    }
  }

  async function handleAddTask(task: CreateTask) {
    if (!user || !editingList) return
    try {
      await addTask(user.uid, editingList.id, task)
      // Refresh the editing list from the store
      const updated = lists.find((l) => l.id === editingList.id)
      if (updated) setEditingList(updated)
    } catch {
      toast.error('Failed to add task')
    }
  }

  async function handleUpdateTask(taskId: string, data: Partial<Task>) {
    if (!user || !editingList) return
    try {
      await updateTask(user.uid, editingList.id, taskId, data)
    } catch {
      toast.error('Failed to update task')
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!user || !editingList) return
    try {
      await deleteTask(user.uid, editingList.id, taskId)
    } catch {
      toast.error('Failed to delete task')
    }
  }

  async function handleDelete() {
    if (!user || !editingList) return
    try {
      await deleteList(user.uid, editingList.id)
      setEditingList(null)
      toast.success('List deleted')
    } catch {
      toast.error('Failed to delete list')
    }
  }

  async function handleActivate(list: TaskList) {
    if (!user) return
    if (list.tasks.length === 0) {
      toast.error('Add some tasks before activating')
      return
    }
    try {
      await activateList(user.uid, list)
      toast.success(`"${list.title}" is now active!`)
    } catch {
      toast.error('Failed to activate list')
    }
  }

  // Keep editingList in sync with store
  const currentEditingList = editingList
    ? lists.find((l) => l.id === editingList.id) || editingList
    : null

  return (
    <AppShell title="Task Lists">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {lists.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-tertiary flex items-center justify-center">
                <svg className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold mb-2">No lists yet</h2>
              <p className="text-text-muted mb-6">Create your first task list to get started</p>
              <Button onClick={() => setShowCreate(true)}>Create List</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {lists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  onEdit={setEditingList}
                  onActivate={handleActivate}
                  isActive={activeList?.listId === list.id}
                />
              ))}

              <Button
                onClick={() => setShowCreate(true)}
                variant="secondary"
                className="w-full"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New List
              </Button>
            </div>
          )}
        </>
      )}

      <CreateListModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />

      <Modal
        isOpen={!!currentEditingList}
        onClose={() => setEditingList(null)}
        title="Edit List"
        size="lg"
      >
        {currentEditingList && (
          <ListEditor
            list={currentEditingList}
            onUpdate={handleUpdate}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onDelete={handleDelete}
            onClose={() => setEditingList(null)}
          />
        )}
      </Modal>
    </AppShell>
  )
}
