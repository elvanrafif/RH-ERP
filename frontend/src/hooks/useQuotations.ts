import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { pb } from '@/lib/pocketbase'
import type { QuotationFilters } from './useQuotationFilters'

export interface CreateQuotationPayload {
  clientId: string
}

interface UseQuotationsOptions {
  filters: QuotationFilters
  page: number
}

/**
 * Single resource hook for quotations — handles data fetching and mutations.
 * Navigation after create is intentionally NOT handled here — pass onSuccess
 * to createQuotation() from the calling page to keep routing concerns out of data hooks.
 */
export function useQuotations({ filters, page }: UseQuotationsOptions) {
  const queryClient = useQueryClient()

  const { data: quotationData, isLoading } = useQuery({
    queryKey: [
      'quotations',
      page,
      filters.debouncedSearch,
      filters.filterClient,
    ],
    queryFn: () => {
      const filterParts: string[] = []

      if (filters.debouncedSearch) {
        filterParts.push(`quotation_number ~ "${filters.debouncedSearch}"`)
      }
      if (filters.filterClient !== 'all') {
        filterParts.push(`client_id = "${filters.filterClient}"`)
      }

      return pb.collection('quotations').getList(page, 50, {
        sort: '-created',
        expand: 'client_id',
        filter: filterParts.join(' && '),
      })
    },
    placeholderData: (prev) => prev,
  })

  const createMutation = useMutation({
    mutationFn: async ({ clientId }: CreateQuotationPayload) => {
      const record = await pb.collection('quotations').create({
        client_id: clientId,
        date: new Date(),
        status: 'draft',
        items: [],
        total_amount: 0,
      })
      const autoNum = `Q-${new Date().toISOString().slice(0, 7).replace('-', '')}-${record.id.substring(0, 4).toUpperCase()}`
      return await pb
        .collection('quotations')
        .update(record.id, { quotation_number: autoNum })
    },
    onSuccess: () => {
      toast.success('Quotation created!')
      queryClient.invalidateQueries({ queryKey: ['quotations'] })
    },
    onError: () => toast.error('Failed to create quotation'),
  })

  return {
    quotations: quotationData?.items ?? [],
    isLoading,
    totalPages: quotationData?.totalPages ?? 1,
    totalItems: quotationData?.totalItems ?? 0,
    createQuotation: createMutation.mutate,
    isCreating: createMutation.isPending,
  }
}
