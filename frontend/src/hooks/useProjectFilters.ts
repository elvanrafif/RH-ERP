import { useState, useMemo } from 'react'
import { TypeProjectsBoolean } from '@/lib/booleans'
import type { Project } from '@/types'
import { getDaysRemaining, getProjectDeadlineDate } from '@/lib/projects/deadline'

type ProjectType = 'architecture' | 'civil' | 'interior'

export type DeadlineFilter = 'all' | 'near' | 'overdue'

interface UseProjectFiltersOptions {
  projects: Project[]
  projectType: ProjectType
  deadlineWarningDays: number
}

interface ProjectStats {
  totalValue: number
  activeCount: number
}

export function useProjectFilters({
  projects,
  projectType,
  deadlineWarningDays,
}: UseProjectFiltersOptions) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPic, setFilterPic] = useState('all')
  const [filterVendor, setFilterVendor] = useState('all')
  const [filterDeadline, setFilterDeadline] = useState<DeadlineFilter>('all')

  const { isCivil, isInterior } = TypeProjectsBoolean(projectType)

  // Stats always computed from raw projects — unaffected by filters
  const stats: ProjectStats = useMemo(
    () =>
      projects.reduce(
        (acc, p) => {
          acc.totalValue += p.contract_value || 0
          acc.activeCount++
          return acc
        },
        { totalValue: 0, activeCount: 0 }
      ),
    [projects]
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

    if (filterDeadline !== 'all') {
      result = result.filter((p) => {
        const date = getProjectDeadlineDate(p)
        if (!date) return false
        const days = getDaysRemaining(date)
        if (filterDeadline === 'overdue') return days < 0
        if (filterDeadline === 'near') return days >= 0 && days <= deadlineWarningDays
        return true
      })
    }

    return result
  }, [projects, searchQuery, filterPic, filterVendor, filterDeadline, isCivil, isInterior, deadlineWarningDays])

  const resultCount = filteredProjects.length

  const hasActiveFilters =
    searchQuery !== '' ||
    filterPic !== 'all' ||
    filterVendor !== 'all' ||
    filterDeadline !== 'all'

  const resetFilters = () => {
    setSearchQuery('')
    setFilterPic('all')
    setFilterVendor('all')
    setFilterDeadline('all')
  }

  return {
    searchQuery,
    setSearchQuery,
    filterPic,
    setFilterPic,
    filterVendor,
    setFilterVendor,
    filterDeadline,
    setFilterDeadline,
    filteredProjects,
    stats,
    resultCount,
    hasActiveFilters,
    resetFilters,
  }
}
