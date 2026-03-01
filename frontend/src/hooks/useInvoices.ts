import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { pb } from '@/lib/pocketbase'
import { getTemplateByType } from '@/pages/invoices/template'
import type { InvoiceFilters } from './useInvoiceFilters'

export type InvoiceType = 'design' | 'sipil' | 'interior'

export interface CreateInvoicePayload {
  type: InvoiceType
  clientId: string
}

interface UseInvoicesOptions {
  filters: InvoiceFilters
  page: number
}

/**
 * Single resource hook for invoices — handles data fetching and mutations.
 * Navigation after create is intentionally NOT handled here — pass onSuccess
 * to createInvoice() from the calling page to keep routing concerns out of data hooks.
 */
export function useInvoices({ filters, page }: UseInvoicesOptions) {
  const queryClient = useQueryClient()

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: [
      'invoices',
      page,
      filters.debouncedSearch,
      filters.filterClient,
      filters.activeTab,
    ],
    queryFn: () => {
      const filterParts: string[] = []

      if (filters.debouncedSearch) {
        filterParts.push(
          `(title ~ "${filters.debouncedSearch}" || invoice_number ~ "${filters.debouncedSearch}")`
        )
      }
      if (filters.filterClient !== 'all') {
        filterParts.push(`client_id = "${filters.filterClient}"`)
      }
      if (filters.activeTab !== 'all') {
        filterParts.push(`type = "${filters.activeTab}"`)
      }

      return pb.collection('invoices').getList(page, 50, {
        sort: '-created',
        expand: 'client_id',
        filter: filterParts.join(' && '),
      })
    },
    placeholderData: (prev) => prev,
  })

  const createMutation = useMutation({
    mutationFn: async ({ type, clientId }: CreateInvoicePayload) => {
      const prefix = type.toUpperCase().substring(0, 3)
      const timestamp = Date.now().toString().slice(-6)

      return await pb.collection('invoices').create({
        invoice_number: `INV-${prefix}-${timestamp}`,
        client_id: clientId,
        type,
        date: new Date(),
        status: 'unpaid',
        active_termin: '1',
        price_per_meter: 200000,
        project_area: 0,
        total_amount: 0,
        bank_details: 'BNI - 0717571663\nIsmail Deyrian Anugrah',
        items: getTemplateByType(type),
      })
    },
    onSuccess: () => {
      toast.success('Invoice dibuat!')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: () => toast.error('Gagal membuat invoice'),
  })

  return {
    invoices: invoiceData?.items ?? [],
    isLoading,
    totalPages: invoiceData?.totalPages ?? 1,
    totalItems: invoiceData?.totalItems ?? 0,
    createInvoice: createMutation.mutate,
    isCreating: createMutation.isPending,
  }
}
