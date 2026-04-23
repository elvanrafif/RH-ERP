// frontend/src/hooks/useClientTracking.ts
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Project } from '@/types'

// Ubah mapping ini untuk mengubah logika date field per tipe project
const DATE_FIELD_BY_TYPE: Record<Project['type'], keyof Project> = {
  civil: 'end_date',
  architecture: 'deadline',
  interior: 'deadline',
}

function getDateValue(project: Project): string | undefined {
  const field = DATE_FIELD_BY_TYPE[project.type]
  const value = project[field]
  return typeof value === 'string' ? value : undefined
}

function getProjectYear(project: Project): number | null {
  const dateStr = getDateValue(project)
  if (!dateStr) return null
  return new Date(dateStr).getFullYear()
}

function getProjectSemester(project: Project): 1 | 2 | null {
  const dateStr = getDateValue(project)
  if (!dateStr) return null
  const month = new Date(dateStr).getMonth() + 1
  return month <= 6 ? 1 : 2
}

async function fetchAllProjects(): Promise<Project[]> {
  return pb.collection('projects').getFullList<Project>({
    expand: 'client',
    sort: '-created',
  })
}

export function useClientTracking(year: number) {
  // queryKey is intentionally year-agnostic: all projects are fetched once and
  // filtered client-side, so changing year does not trigger a new network request.
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['client-tracking'],
    queryFn: fetchAllProjects,
    staleTime: 1000 * 60 * 5,
  })

  const availableYears = Array.from(
    new Set(projects.map(getProjectYear).filter((y): y is number => y !== null))
  ).sort((a, b) => b - a)

  const yearProjects = projects.filter((p) => getProjectYear(p) === year)
  const s1 = yearProjects.filter((p) => getProjectSemester(p) === 1)
  const s2 = yearProjects.filter((p) => getProjectSemester(p) === 2)

  return { s1, s2, availableYears, isLoading }
}
