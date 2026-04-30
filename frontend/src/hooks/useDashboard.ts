import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Project } from '@/types'

const fetchDashboardStats = async () => {
  const [projects, clientsResult, prospectsResult, pendingSurveysResult] =
    await Promise.all([
      pb.collection('projects').getFullList<Project>(),
      pb.collection('clients').getList(1, 1, { fields: 'id' }),
      pb.collection('prospects').getList(1, 1, { fields: 'id' }),
      pb
        .collection('surveys')
        .getList(1, 1, { filter: 'status = "pending"', fields: 'id' }),
    ])

  const totalOmzet = projects.reduce((acc, curr) => acc + curr.value, 0)
  const totalProjects = projects.length
  const totalClients = clientsResult.totalItems
  const totalProspects = prospectsResult.totalItems
  const pendingSurveys = pendingSurveysResult.totalItems

  return {
    records: projects,
    totalOmzet,
    totalProjects,
    totalClients,
    totalProspects,
    pendingSurveys,
  }
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 60 * 5,
  })
}
