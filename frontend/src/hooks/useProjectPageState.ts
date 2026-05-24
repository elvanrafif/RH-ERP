import { useState } from 'react'
import type { Project } from '@/types'
import { useAutoOpenProject } from '@/hooks/useAutoOpenProject'

interface Options {
  projects: Project[]
  isLoading: boolean
  deleteProject: (id: string, options: { onSuccess: () => void }) => void
}

export function useProjectPageState({ projects, isLoading, deleteProject }: Options) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewingProject, setViewingProject] = useState<Project | null>(null)

  const { projectToView: autoOpenProject, setProjectToView: setAutoOpenProject } =
    useAutoOpenProject(projects, isLoading)

  const openProject = viewingProject ?? autoOpenProject

  function handleCreate() {
    setEditingProject(null)
    setIsDialogOpen(true)
  }

  function handleEdit(project: Project) {
    setEditingProject(project)
    setIsDialogOpen(true)
  }

  function handleDelete() {
    if (!deleteId) return
    deleteProject(deleteId, { onSuccess: () => setDeleteId(null) })
  }

  function handleCloseViewModal(open: boolean) {
    if (!open) {
      setViewingProject(null)
      setAutoOpenProject(null)
    }
  }

  return {
    isDialogOpen,
    setIsDialogOpen,
    editingProject,
    setEditingProject,
    deleteId,
    setDeleteId,
    viewingProject: viewingProject,
    setViewingProject,
    openProject,
    handleCreate,
    handleEdit,
    handleDelete,
    handleCloseViewModal,
  }
}
