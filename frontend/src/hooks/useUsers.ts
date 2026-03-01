import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { User } from '@/types'

/**
 * Reusable hook for fetching the full users list.
 * Used in ProjectPageTemplate (PIC filter), UserForm, etc.
 */
export function useUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-list'],
    queryFn: () => pb.collection('users').getFullList<User>({ sort: 'name' }),
  })

  return { users, isLoading }
}
