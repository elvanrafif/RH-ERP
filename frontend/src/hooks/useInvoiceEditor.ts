import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { toast } from 'sonner'

export function useInvoiceEditor(id: string | undefined) {
  const queryClient = useQueryClient()

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () =>
      pb.collection('invoices').getOne(id as string, { expand: 'client_id' }),
    enabled: !!id,
  })

  const { data: linkedProject } = useQuery({
    queryKey: ['project-by-invoice', id],
    queryFn: async () => {
      const results = await pb.collection('projects').getList(1, 1, {
        filter: `invoice_id = "${id}"`,
        expand: 'client',
        fields: 'id,type,expand.client.company_name,expand.client.salutation',
      })
      return results.items[0] ?? null
    },
    enabled: !!id,
  })

  const saveMutation = useMutation({
    mutationFn: (formData: FormData) =>
      pb.collection('invoices').update(id as string, formData),
    onSuccess: () => {
      toast.success('Invoice & Official Document saved')
      queryClient.invalidateQueries({ queryKey: ['invoice', id] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: () => toast.error('Failed to save changes'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => pb.collection('invoices').delete(id as string),
    onSuccess: () => {
      toast.success('Invoice deleted')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: () => toast.error('Failed to delete invoice'),
  })

  return {
    invoice,
    isLoading,
    linkedProject,
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    deleteInvoice: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  }
}
