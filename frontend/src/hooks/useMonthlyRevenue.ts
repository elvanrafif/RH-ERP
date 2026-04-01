import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { buildMonthlyRevenueData } from '@/lib/invoicing/monthlyStats'
import type { MonthlyRevenueData } from '@/lib/invoicing/monthlyStats'

export function useMonthlyRevenue(year = new Date().getFullYear()) {
  return useQuery<MonthlyRevenueData[]>({
    queryKey: ['monthly-revenue', year],
    queryFn: async () => {
      const invoices = await pb.collection('invoices').getFullList({
        sort: '-updated',
      })
      return buildMonthlyRevenueData(invoices, year)
    },
    staleTime: 1000 * 60 * 5,
  })
}
