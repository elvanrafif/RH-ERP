import { toast } from 'sonner'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

interface UseFormMutationOptions<TValues> {
  collection: string
  queryKey: string[]
  initialData?: { id: string } | null
  onSuccess?: () => void
}

export function useFormMutation<TValues>({
  collection,
  queryKey,
  initialData,
  onSuccess,
}: UseFormMutationOptions<TValues>) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (values: TValues) => {
      if (initialData) {
        return await pb
          .collection(collection)
          .update(initialData.id, values as Record<string, unknown>)
      }
      return await pb
        .collection(collection)
        .create(values as Record<string, unknown>)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      onSuccess?.()
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to save data.'
      toast.error(message)
    },
  })

  return {
    mutate: (values: TValues) => mutation.mutate(values),
    isPending: mutation.isPending,
  }
}
