import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { User } from '@/types'

/**
 * Fetches the full user list with role expansion for the User Management page.
 * Uses a separate query key from useUsers to allow independent cache management.
 */
export function useUserManagement() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-management'],
    queryFn: () =>
      pb.collection('users').getFullList<User>({
        sort: 'created',
        expand: 'roleId',
      }),
  })

  return { users, isLoading }
}
