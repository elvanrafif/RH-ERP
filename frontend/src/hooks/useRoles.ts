import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

/**
 * Reusable hook for fetching the full roles list.
 * Used in UserForm (role selector) and RoleManagement page.
 */
export function useRoles() {
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles-list'],
    queryFn: () => pb.collection('roles').getFullList({ sort: 'name' }),
  })

  return { roles, isLoading }
}
