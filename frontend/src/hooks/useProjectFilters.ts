import { useState, useMemo } from 'react'
import { TypeProjectsBoolean } from '@/lib/booleans'
import type { Project } from '@/types'

type ProjectType = 'architecture' | 'civil' | 'interior'

interface UseProjectFiltersOptions {
  projects: Project[]
  projectType: ProjectType
}

interface ProjectStats {
  totalValue: number
  activeCount: number
  urgentCount: number
}

/**
 * Handles client-side filtering and stats calculation for a project list.
 * Receives raw projects from useProjects and returns filtered results + stats.
 */
export function useProjectFilters({ projects, projectType }: UseProjectFiltersOptions) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPic, setFilterPic] = useState('all')

  const { isCivil } = TypeProjectsBoolean(projectType)

  const filteredProjects = useMemo(() => {
    let result = [...projects]

    if (searchQuery) {
      const lower = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.expand?.client?.company_name?.toLowerCase().includes(lower) ||
          p.meta_data?.area_scope?.toLowerCase().includes(lower) ||
          p.meta_data?.pic_lapangan?.toLowerCase().includes(lower)
      )
    }

    if (filterPic !== 'all') {
      if (isCivil) {
        result =
          filterPic === 'unassigned'
            ? result.filter((p) => !p.meta_data?.pic_lapangan)
            : result.filter((p) => p.meta_data?.pic_lapangan === filterPic)
      } else {
        result =
          filterPic === 'unassigned'
            ? result.filter((p) => !p.assignee)
            : result.filter((p) => p.assignee === filterPic)
      }
    }

    return result
  }, [projects, searchQuery, filterPic, isCivil])

  const stats: ProjectStats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    return filteredProjects.reduce(
      (acc, p) => {
        acc.totalValue += p.contract_value || 0
        acc.activeCount++
        if (p.deadline) {
          const d = new Date(p.deadline)
          if (d <= nextWeek && d >= today) acc.urgentCount++
        }
        return acc
      },
      { totalValue: 0, activeCount: 0, urgentCount: 0 }
    )
  }, [filteredProjects])

  const hasActiveFilters = searchQuery !== '' || filterPic !== 'all'

  const resetFilters = () => {
    setSearchQuery('')
    setFilterPic('all')
  }

  return {
    searchQuery,
    setSearchQuery,
    filterPic,
    setFilterPic,
    filteredProjects,
    stats,
    hasActiveFilters,
    resetFilters,
  }
}
