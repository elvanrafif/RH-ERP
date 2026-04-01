import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Project } from '@/types'
import { PROJECT_STATUS, PROJECT_TYPE } from '@/lib/constant'

export interface ProjectStats {
  statusCount: Record<string, number>
  statusByType: Record<string, Record<string, number>>
  typeCount: Record<string, number>
  valueByDivision: Record<string, number>
  pipelineValue: number
  completedValue: number
  averageValueByType: Record<string, number>
  topProjects: Project[]
  totalCount: number
}

const DONE_STATUS_VALUES = new Set<string>(['done', 'finish', 'finished'])
const ACTIVE_STATUS_VALUES = new Set<string>([
  PROJECT_STATUS.DESIGN,
  PROJECT_STATUS.PROGRESS,
])

function buildProjectStats(projects: Project[]): ProjectStats {
  const statusCount: Record<string, number> = {}
  const statusByType: Record<string, Record<string, number>> = {
    [PROJECT_TYPE.ARCHITECTURE]: {},
    [PROJECT_TYPE.CIVIL]: {},
    [PROJECT_TYPE.INTERIOR]: {},
  }
  const typeCount: Record<string, number> = {
    [PROJECT_TYPE.ARCHITECTURE]: 0,
    [PROJECT_TYPE.CIVIL]: 0,
    [PROJECT_TYPE.INTERIOR]: 0,
  }
  const valueByDivision: Record<string, number> = {
    [PROJECT_TYPE.ARCHITECTURE]: 0,
    [PROJECT_TYPE.CIVIL]: 0,
    [PROJECT_TYPE.INTERIOR]: 0,
  }
  const typeValueSum: Record<string, number> = {}
  const typeValueCount: Record<string, number> = {}
  let pipelineValue = 0
  let completedValue = 0

  for (const p of projects) {
    const value = p.value || p.contract_value || 0

    statusCount[p.status] = (statusCount[p.status] ?? 0) + 1
    if (p.type in statusByType) {
      statusByType[p.type][p.status] = (statusByType[p.type][p.status] ?? 0) + 1
    }
    if (p.type in typeCount) typeCount[p.type]++
    if (p.type in valueByDivision) valueByDivision[p.type] += value

    if (ACTIVE_STATUS_VALUES.has(p.status)) {
      pipelineValue += value
    }
    if (DONE_STATUS_VALUES.has(p.status)) {
      completedValue += value
    }

    typeValueSum[p.type] = (typeValueSum[p.type] ?? 0) + value
    typeValueCount[p.type] = (typeValueCount[p.type] ?? 0) + 1
  }

  const averageValueByType: Record<string, number> = {}
  for (const type of Object.keys(typeValueSum)) {
    const count = typeValueCount[type] ?? 0
    averageValueByType[type] = count > 0 ? typeValueSum[type] / count : 0
  }

  const topProjects = [...projects]
    .sort(
      (a, b) =>
        (b.value || b.contract_value || 0) - (a.value || a.contract_value || 0)
    )
    .slice(0, 5)

  return {
    statusCount,
    statusByType,
    typeCount,
    valueByDivision,
    pipelineValue,
    completedValue,
    averageValueByType,
    topProjects,
    totalCount: projects.length,
  }
}

export function useProjectStats() {
  return useQuery<ProjectStats>({
    queryKey: ['project-stats'],
    queryFn: async () => {
      const projects = await pb.collection('projects').getFullList<Project>({
        expand: 'client',
        sort: '-created',
      })
      return buildProjectStats(projects)
    },
    staleTime: 1000 * 60 * 5,
  })
}
