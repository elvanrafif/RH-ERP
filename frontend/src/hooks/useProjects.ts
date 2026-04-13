import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { pb } from '@/lib/pocketbase'
import type { Project } from '@/types'

type ProjectType = 'architecture' | 'civil' | 'interior'
export type ProjectStatusFilter = 'active' | 'all' | 'finished'

interface UseProjectsOptions {
  projectType: ProjectType
  statusFilter: ProjectStatusFilter
}

/**
 * Single resource hook for projects — handles data fetching and mutations.
 * UI state (deleteId, editingProject) stays in the calling component.
 * Pass onSuccess callbacks from the page to handle post-mutation UI updates.
 */
export function useProjects({ projectType, statusFilter }: UseProjectsOptions) {
  const queryClient = useQueryClient()

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', projectType, statusFilter],
    queryFn: () => {
      let filterRule = `type = '${projectType}'`
      if (statusFilter === 'active')
        filterRule += ` && status != 'done' && status != 'finish'`
      if (statusFilter === 'finished')
        filterRule += ` && (status = 'done' || status = 'finish')`

      return pb.collection('projects').getFullList<Project>({
        sort: '-created',
        expand: 'client,assignee,vendor',
        filter: filterRule,
      })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      pb.collection('projects').update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Status updated')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pb.collection('projects').delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted')
    },
    onError: () => toast.error('Failed to delete project'),
  })

  return {
    projects,
    isLoading,
    updateStatus: updateStatusMutation.mutate,
    deleteProject: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}
