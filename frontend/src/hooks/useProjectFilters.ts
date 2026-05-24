import { useState, useMemo } from 'react'
import { TypeProjectsBoolean } from '@/lib/booleans'
import type { Project } from '@/types'
import { getDaysRemaining, getProjectDeadlineDate } from '@/lib/projects/deadline'
import { computeProjectStats } from '@/lib/projects/statistics'

type ProjectType = 'architecture' | 'civil' | 'interior'

export type DeadlineFilter = 'all' | 'near' | 'overdue'

interface UseProjectFiltersOptions {
  projects: Project[]
  projectType: ProjectType
  deadlineWarningDays: number
}

export function useProjectFilters({
  projects,
  projectType,
  deadlineWarningDays,
}: UseProjectFiltersOptions) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPic, setFilterPic] = useState('all')
  const [filterVendor, setFilterVendor] = useState('all')
  const [filterManagedBy, setFilterManagedBy] = useState('all')
  const [filterDeadline, setFilterDeadline] = useState<DeadlineFilter>('all')

  const { isCivil, isInterior } = TypeProjectsBoolean(projectType)

  const stats = useMemo(
    () => computeProjectStats(projects, deadlineWarningDays),
    [projects, deadlineWarningDays]
  )

  const filteredProjects = useMemo(() => {
    let result = [...projects]

    if (searchQuery) {
      const lower = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.expand?.client?.company_name?.toLowerCase().includes(lower) ||
          p.meta_data?.area_scope?.toLowerCase().includes(lower) ||
          p.expand?.vendor?.name?.toLowerCase().includes(lower)
      )
    }

    if (filterPic !== 'all') {
      if (isCivil) {
        result =
          filterPic === 'unassigned'
            ? result.filter((p) => !p.vendor)
            : result.filter((p) => p.vendor === filterPic)
      } else {
        result =
          filterPic === 'unassigned'
            ? result.filter((p) => !p.assignee)
            : result.filter((p) => p.assignee === filterPic)
      }
    }

    if (isInterior && filterVendor !== 'all') {
      result =
        filterVendor === 'unassigned'
          ? result.filter((p) => !p.vendor)
          : result.filter((p) => p.vendor === filterVendor)
    }

    if (isCivil && filterManagedBy !== 'all') {
      result =
        filterManagedBy === 'unassigned'
          ? result.filter((p) => !p.assignee)
          : result.filter((p) => p.assignee === filterManagedBy)
    }

    if (filterDeadline !== 'all') {
      result = result.filter((p) => {
        const date = getProjectDeadlineDate(p)
        if (!date) return false
        const days = getDaysRemaining(date)
        if (filterDeadline === 'overdue') return days < 0
        if (filterDeadline === 'near')
          return days >= 0 && days <= deadlineWarningDays
        return true
      })
    }

    return result
  }, [
    projects,
    searchQuery,
    filterPic,
    filterVendor,
    filterManagedBy,
    filterDeadline,
    isCivil,
    isInterior,
    deadlineWarningDays,
  ])

  const resultCount = filteredProjects.length

  const hasActiveFilters =
    searchQuery !== '' ||
    filterPic !== 'all' ||
    filterVendor !== 'all' ||
    filterManagedBy !== 'all' ||
    filterDeadline !== 'all'

  const resetFilters = () => {
    setSearchQuery('')
    setFilterPic('all')
    setFilterVendor('all')
    setFilterManagedBy('all')
    setFilterDeadline('all')
  }

  return {
    searchQuery,
    setSearchQuery,
    filterPic,
    setFilterPic,
    filterVendor,
    setFilterVendor,
    filterManagedBy,
    setFilterManagedBy,
    filterDeadline,
    setFilterDeadline,
    filteredProjects,
    stats,
    resultCount,
    hasActiveFilters,
    resetFilters,
  }
}
