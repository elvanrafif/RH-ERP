import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { escapePbFilter } from '@/lib/helpers'
import { useDebounce } from '@/hooks/useDebounce'
import type { Client } from '@/types'

export function useClientSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300)
  const isSearching = debouncedQuery.length >= 2

  const { data: clients, isLoading } = useQuery({
    queryKey: ['client-search', debouncedQuery],
    queryFn: async () => {
      if (isSearching) {
        const escaped = escapePbFilter(debouncedQuery)
        return pb.collection('clients').getFullList<Client>({
          filter: `company_name ~ "${escaped}" || email ~ "${escaped}"`,
          sort: 'company_name',
        })
      }
      const result = await pb.collection('clients').getList<Client>(1, 5, {
        sort: '-created',
      })
      return result.items
    },
  })

  return { clients, isLoading, isRecent: !isSearching }
}
