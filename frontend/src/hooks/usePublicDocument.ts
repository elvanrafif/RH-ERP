import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

export function usePublicDocument(docType: string | undefined, id: string | undefined) {
  return useQuery({
    queryKey: ['public-doc', docType, id],
    queryFn: async () => {
      return await pb
        .collection(docType as string)
        .getOne(id as string, { expand: 'client_id' })
    },
    retry: false,
    enabled: !!docType && !!id,
  })
}
