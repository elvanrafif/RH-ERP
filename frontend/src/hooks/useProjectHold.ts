import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { pb } from '@/lib/pocketbase'
import type { Project } from '@/types'

interface UseProjectHoldOptions {
  onHoldSuccess: () => void
  onResumeSuccess: () => void
}

export function useProjectHold(
  project: Project | null,
  { onHoldSuccess, onResumeSuccess }: UseProjectHoldOptions
) {
  const queryClient = useQueryClient()

  const holdMutation = useMutation({
    mutationFn: async (reason: string) => {
      return pb.collection('projects').update(project!.id, {
        is_on_hold: true,
        hold_reason: reason || null,
        held_at: new Date().toISOString(),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project put on hold')
      onHoldSuccess()
    },
    onError: () => toast.error('Failed to put project on hold'),
  })

  const resumeMutation = useMutation({
    mutationFn: async () => {
      return pb.collection('projects').update(project!.id, {
        is_on_hold: false,
        hold_reason: null,
        held_at: null,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project resumed')
      onResumeSuccess()
    },
    onError: () => toast.error('Failed to resume project'),
  })

  return { holdMutation, resumeMutation }
}
