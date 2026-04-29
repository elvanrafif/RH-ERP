import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Survey } from '@/types'

interface UseSurveysOptions {
  searchTerm?: string
}

export function useSurveys({ searchTerm = '' }: UseSurveysOptions = {}) {
  const { data: surveys = [], isLoading } = useQuery({
    queryKey: ['surveys'],
    queryFn: async () =>
      await pb.collection('surveys').getFullList<Survey>({
        sort: '-schedule',
        expand: 'client,surveyor',
      }),
  })

  const filtered = searchTerm
    ? surveys.filter((s) =>
        s.expand?.client?.company_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : surveys

  return { surveys: filtered, isLoading }
}
