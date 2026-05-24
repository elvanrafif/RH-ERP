import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Project, Vendor } from '@/types'
import { DONE_STATUSES, DEADLINE_WARNING_DAYS } from '@/lib/constant'
import { getProjectDeadlineDate, getDaysRemaining } from '@/lib/projects/deadline'

export interface VendorGroup {
  vendor: Vendor
  projects: Project[]
  hasOverdue: boolean
  hasNearDeadline: boolean
}

export interface CivilTeamData {
  vendorGroups: VendorGroup[]
  totalProjects: number
  nearDeadlineCount: number
  overdueCount: number
}

export function useCivilTeamProjects() {
  return useQuery<CivilTeamData>({
    queryKey: ['civil-team-projects'],
    queryFn: async () => {
      const excludeFilter = DONE_STATUSES.map((s) => `status != '${s}'`).join(' && ')
      const filter = `type = 'civil' && ${excludeFilter}`

      const projects = await pb.collection('projects').getFullList<Project>({
        filter,
        expand: 'client,vendor',
        sort: 'end_date',
      })

      const threshold = DEADLINE_WARNING_DAYS.civil
      const vendorMap = new Map<string, { vendor: Vendor; projects: Project[] }>()

      for (const project of projects) {
        const vendor = project.expand?.vendor
        if (!vendor) continue
        if (!vendorMap.has(vendor.id)) {
          vendorMap.set(vendor.id, { vendor, projects: [] })
        }
        vendorMap.get(vendor.id)!.projects.push(project)
      }

      let nearDeadlineCount = 0
      let overdueCount = 0

      const vendorGroups: VendorGroup[] = Array.from(vendorMap.values()).map(
        ({ vendor, projects }) => {
          let hasOverdue = false
          let hasNearDeadline = false
          for (const p of projects) {
            if (p.is_on_hold) continue
            const date = getProjectDeadlineDate(p)
            if (!date) continue
            const days = getDaysRemaining(date)
            if (days < 0) {
              hasOverdue = true
              overdueCount++
            } else if (days <= threshold) {
              hasNearDeadline = true
              nearDeadlineCount++
            }
          }
          return { vendor, projects, hasOverdue, hasNearDeadline }
        }
      )

      vendorGroups.sort((a, b) => {
        if (a.hasOverdue !== b.hasOverdue) return a.hasOverdue ? -1 : 1
        if (a.hasNearDeadline !== b.hasNearDeadline) return a.hasNearDeadline ? -1 : 1
        return 0
      })

      const totalProjects = vendorGroups.reduce((sum, g) => sum + g.projects.length, 0)

      return { vendorGroups, totalProjects, nearDeadlineCount, overdueCount }
    },
  })
}
