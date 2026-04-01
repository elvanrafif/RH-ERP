import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Project } from '@/types'

const fetchDashboardStats = async () => {
  const [records, clientsResult, quotationsResult] = await Promise.all([
    pb.collection('projects').getFullList<Project>(),
    pb.collection('clients').getList(1, 1),
    pb.collection('quotations').getList(1, 1),
  ])

  const totalOmzet = records.reduce((acc, curr) => acc + curr.value, 0)
  const totalProjects = records.length
  const totalClients = clientsResult.totalItems
  const totalQuotations = quotationsResult.totalItems

  return { records, totalOmzet, totalProjects, totalClients, totalQuotations }
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 60 * 5,
  })
}
