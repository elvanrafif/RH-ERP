import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { buildQuotationRevenueData } from '@/lib/invoicing/quotationStats'
import type { QuotationRevenueData } from '@/lib/invoicing/quotationStats'

export function useQuotationRevenue(filter: string, appliedStart: string, appliedEnd: string) {
  return useQuery<QuotationRevenueData>({
    queryKey: ['document-quotations', filter, appliedStart, appliedEnd],
    queryFn: async () => {
      const quotations = await pb.collection('quotations').getFullList({
        sort: '-created',
        expand: 'project_id.client_id,client_id',
      })
      return buildQuotationRevenueData(quotations, filter, appliedStart, appliedEnd)
    },
  })
}
