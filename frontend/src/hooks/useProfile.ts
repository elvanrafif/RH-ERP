import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { User } from '@/types'

/**
 * Fetches the currently authenticated user's profile with role expansion.
 */
export function useProfile() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => {
      const currentId = pb.authStore.model?.id
      if (!currentId) return null
      return pb.collection('users').getOne<User>(currentId, { expand: 'roleId' })
    },
  })

  return { user, isLoading }
}
