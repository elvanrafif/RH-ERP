import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Survey } from '@/types'

interface UseSurveysOptions {
  searchTerm?: string
  filterPic?: string
  filterStatus?: 'all' | 'pending' | 'done'
}

export function useSurveys({
  searchTerm = '',
  filterPic = 'all',
  filterStatus = 'all',
}: UseSurveysOptions = {}) {
  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () =>
      await pb.collection('surveys').getFullList<Survey>({
        sort: '-schedule',
        expand: 'client,surveyor',
      }),
  })

  const filtered = surveys.filter((s) => {
    if (searchTerm && !s.expand?.client?.company_name.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (filterPic !== 'all' && s.surveyor !== filterPic) return false
    if (filterStatus !== 'all' && s.status !== filterStatus) return false
    return true
  })

  return { surveys: filtered, isLoading }
}
