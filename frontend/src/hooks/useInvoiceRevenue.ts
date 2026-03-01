import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { buildInvoiceRevenueData } from '@/lib/invoicing/revenueStats'
import type { InvoiceRevenueData } from '@/lib/invoicing/revenueStats'

export function useInvoiceRevenue(filter: string, appliedStart: string, appliedEnd: string) {
  return useQuery<InvoiceRevenueData>({
    queryKey: ['document-invoices', filter, appliedStart, appliedEnd],
    queryFn: async () => {
      const invoices = await pb.collection('invoices').getFullList({
        sort: '-updated',
        expand: 'project_id.client_id,client_id',
      })
      return buildInvoiceRevenueData(invoices, filter, appliedStart, appliedEnd)
    },
  })
}
