import { toast } from 'sonner'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { ProspectFormValues } from '@/lib/validations/prospect'
import type { Prospect } from '@/types'

interface UseProspectMutationOptions {
  initialData?: Prospect | null
  onSuccess?: () => void
}

export function useProspectMutation({
  initialData,
  onSuccess,
}: UseProspectMutationOptions) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: ProspectFormValues) => {
      const toDateTimePB = (val?: string) => {
        if (!val) return null
        // datetime-local gives local time without timezone (e.g. "2026-04-13T17:00")
        // new Date() treats this as local time → toISOString() converts to UTC correctly
        const withSeconds = val.length === 16 ? val + ':00' : val
        return new Date(withSeconds).toISOString()
      }
      const payload = {
        ...values,
        land_size: values.land_size === '' ? null : values.land_size,
        meeting_schedule: toDateTimePB(values.meeting_schedule),
        survey_schedule: toDateTimePB(values.survey_schedule),
      }
      if (initialData) {
        return await pb.collection('prospects').update(initialData.id, payload)
      }
      return await pb.collection('prospects').create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] })
      toast.success(initialData ? 'Prospect updated.' : 'Prospect added.')
      onSuccess?.()
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to save prospect.'
      toast.error(message)
    },
  })
}
