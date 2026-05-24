import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { toast } from 'sonner'

export function useQuotationEditor(id: string | undefined) {
  const queryClient = useQueryClient()

  const { data: quotation, isLoading } = useQuery({
    queryKey: ['quotation', id],
    queryFn: () =>
      pb.collection('quotations').getOne(id as string, { expand: 'client_id' }),
    enabled: !!id,
  })

  const saveMutation = useMutation({
    mutationFn: (formData: FormData) =>
      pb.collection('quotations').update(id as string, formData),
    onSuccess: () => {
      toast.success('Quotation & Official Document saved')
      queryClient.invalidateQueries({ queryKey: ['quotation', id] })
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    },
    onError: () => toast.error('Failed to save changes'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => pb.collection('quotations').delete(id as string),
    onSuccess: () => {
      toast.success('Quotation deleted')
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    },
    onError: () => toast.error('Failed to delete quotation'),
  })

  return {
    quotation,
    isLoading,
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    deleteQuotation: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}
