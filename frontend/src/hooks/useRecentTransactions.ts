import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { buildRecentTransactions } from '@/lib/invoicing/recentTransactions'
import type { RecentTransaction } from '@/lib/invoicing/recentTransactions'

export function useRecentTransactions() {
  return useQuery<RecentTransaction[]>({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      const [invoices, quotations] = await Promise.all([
        pb.collection('invoices').getFullList({
          sort: '-updated',
          expand: 'client_id',
        }),
        pb.collection('quotations').getFullList({
          sort: '-updated',
          expand: 'client_id',
        }),
      ])
      return buildRecentTransactions(invoices, quotations)
    },
    staleTime: 1000 * 60 * 5,
  })
}
