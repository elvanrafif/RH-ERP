import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

/**
 * Reusable hook for fetching the full clients list.
 * Used across InvoicesPage, QuotationsPage, ProjectForm, etc.
 */
export function useClients() {
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients-list'],
    queryFn: () => pb.collection('clients').getFullList({ sort: 'company_name' }),
  })

  return { clients, isLoading }
}
