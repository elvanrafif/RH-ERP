import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Client } from '@/types'

/**
 * Reusable hook for fetching the full clients list.
 * Used across InvoicesPage, QuotationsPage, ProjectForm, ClientsPage, etc.
 *
 * @param searchTerm - Optional search string to filter by name, email, phone, or address.
 *                     When omitted, returns all clients sorted by company_name.
 */
export function useClients(searchTerm = '') {
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients', searchTerm],
    queryFn: async () => {
      const filter = searchTerm
        ? `company_name ~ "${searchTerm}" || email ~ "${searchTerm}" || phone ~ "${searchTerm}" || address ~ "${searchTerm}"`
        : ''
      return await pb.collection('clients').getFullList<Client>({
        sort: searchTerm ? '-created' : 'company_name',
        filter,
      })
    },
  })

  return { clients, isLoading }
}
