import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Client } from '@/types'

/**
 * Reusable hook for fetching the full clients list.
 * Used across InvoicesPage, QuotationsPage, ProjectForm, ClientsPage, etc.
 *
 * @param searchTerm - Optional search string to filter by name, email, phone, or address.
 * @param filterPic  - Optional user ID to filter clients by PIC. Pass 'all' or '' to skip.
 */
export function useClients(searchTerm = '', filterPic = '') {
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', searchTerm, filterPic],
    queryFn: async () => {
      const parts: string[] = []
      if (searchTerm)
        parts.push(
          `(company_name ~ "${searchTerm}" || email ~ "${searchTerm}" || phone ~ "${searchTerm}" || address ~ "${searchTerm}")`
        )
      if (filterPic && filterPic !== 'all') parts.push(`pic_users ~ "${filterPic}"`)
      return await pb.collection('clients').getFullList<Client>({
        sort: '-created',
        filter: parts.join(' && '),
        expand: 'pic_users',
      })
    },
  })

  return { clients, isLoading }
}
