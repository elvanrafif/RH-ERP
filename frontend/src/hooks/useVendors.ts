import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Vendor } from '@/types'

interface UseVendorsOptions {
  searchTerm?: string
  projectType?: 'civil' | 'interior' | ''
}

export function useVendors({ searchTerm = '', projectType = '' }: UseVendorsOptions = {}) {
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors', searchTerm, projectType],
    queryFn: async () => {
      const filters: string[] = []

      if (searchTerm) {
        filters.push(`name ~ "${searchTerm}" || phone ~ "${searchTerm}"`)
      }
      if (projectType) {
        filters.push(`project_type = "${projectType}"`)
      }

      return await pb.collection('vendors').getFullList<Vendor>({
        sort: 'name',
        filter: filters.join(' && '),
      })
    },
  })

  return { vendors, isLoading }
}
