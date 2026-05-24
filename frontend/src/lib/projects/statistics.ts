import { formatCompactCurrency } from '@/lib/formatting/currency'
import { formatClientName } from '@/components/shared/ClientName'
import {
  WORKLOAD_OVERLOAD_THRESHOLD,
  DIVISION,
  PROJECT_TYPE,
} from '@/lib/constant'
import { getProjectDeadlineDate, getDaysRemaining } from './deadline'
import type { Project } from '@/types'

export interface ProjectStats {
  activeCount: number
  overdueCount: number
  nearDeadlineCount: number
}

export function computeProjectStats(
  projects: Project[],
  deadlineWarningDays: number
): ProjectStats {
  let activeCount = 0
  let overdueCount = 0
  let nearDeadlineCount = 0
  for (const p of projects) {
    activeCount++
    const date = getProjectDeadlineDate(p)
    if (!date) continue
    const days = getDaysRemaining(date)
    if (days < 0) overdueCount++
    else if (days <= deadlineWarningDays) nearDeadlineCount++
  }
  return { activeCount, overdueCount, nearDeadlineCount }
}

interface StatUser {
  id: string
  name: string
  division?: string
}

interface StatProject {
  type: string
  value?: number
  total_amount?: number
  expand?: {
    vendor?: { name: string }
    client?: { company_name: string; salutation?: string }
    invoice_id?: { total_amount?: number }
  }
  assignee?: string | string[]
}

interface StatsRecord {
  count: number
  value: number
  projects: string[]
}

export interface WorkloadChartEntry {
  name: string
  count: number
  value: number
  countPercentage: string
  valuePercentage: string
  displayLabelCount: string
  displayLabelValue: string
  isOverload: boolean
  projects: string[]
}

export interface WorkloadResult {
  data: WorkloadChartEntry[]
  totalCount: number
  totalValue: number
}

export interface WorkloadData {
  architecture: WorkloadResult
  civil: WorkloadResult
  interior: WorkloadResult
}

function toChartData(
  stats: Record<string, StatsRecord>,
  total: StatsRecord
): WorkloadChartEntry[] {
  return Object.entries(stats)
    .map(([name, data]) => {
      const countPercentage =
        total.count > 0 ? ((data.count / total.count) * 100).toFixed(0) : '0'
      const valuePercentage =
        total.value > 0 ? ((data.value / total.value) * 100).toFixed(0) : '0'
      return {
        name,
        count: data.count,
        value: data.value,
        countPercentage,
        valuePercentage,
        displayLabelCount: `${data.count} (${countPercentage}%)`,
        displayLabelValue: formatCompactCurrency(data.value),
        isOverload: data.count >= WORKLOAD_OVERLOAD_THRESHOLD,
        projects: data.projects,
      }
    })
    .sort((a, b) => b.count - a.count)
}

export function buildWorkloadData(
  users: StatUser[],
  projects: StatProject[]
): WorkloadData {
  const userMap = new Map<string, string>()
  users.forEach((u) => userMap.set(u.id, u.name))

  const archStats: Record<string, StatsRecord> = {}
  const civilStats: Record<string, StatsRecord> = {}
  const interiorStats: Record<string, StatsRecord> = {}
  let archTotal: StatsRecord = { count: 0, value: 0, projects: [] }
  let civilTotal: StatsRecord = { count: 0, value: 0, projects: [] }
  let interiorTotal: StatsRecord = { count: 0, value: 0, projects: [] }

  users.forEach((u) => {
    if (
      u.division === DIVISION.ARCHITECTURE ||
      u.division === PROJECT_TYPE.ARCHITECTURE
    )
      archStats[u.name] = { count: 0, value: 0, projects: [] }
    if (u.division === DIVISION.INTERIOR)
      interiorStats[u.name] = { count: 0, value: 0, projects: [] }
  })

  projects.forEach((p) => {
    const type = p.type
    const projectValue =
      p.expand?.invoice_id?.total_amount || p.value || p.total_amount || 0
    const clientName = p.expand?.client
      ? formatClientName(p.expand.client)
      : '—'

    if (type === PROJECT_TYPE.CIVIL || type === DIVISION.CIVIL) {
      civilTotal.count++
      civilTotal.value += projectValue
      const vendorName = p.expand?.vendor?.name
      if (vendorName) {
        if (!civilStats[vendorName])
          civilStats[vendorName] = { count: 0, value: 0, projects: [] }
        civilStats[vendorName].count += 1
        civilStats[vendorName].value += projectValue
        civilStats[vendorName].projects.push(clientName)
      }
    } else {
      const assignees: string[] = Array.isArray(p.assignee)
        ? p.assignee
        : p.assignee
          ? [p.assignee]
          : []
      let addedToArch = false
      let addedToInt = false
      assignees.forEach((userId: string) => {
        const picName = userMap.get(userId)
        if (!picName) return
        if (
          type === PROJECT_TYPE.ARCHITECTURE ||
          type === DIVISION.ARCHITECTURE
        ) {
          if (!addedToArch) {
            archTotal.count++
            archTotal.value += projectValue
            addedToArch = true
          }
          if (archStats[picName] !== undefined) {
            archStats[picName].count += 1
            archStats[picName].value += projectValue
            archStats[picName].projects.push(clientName)
          }
        } else if (type === PROJECT_TYPE.INTERIOR) {
          if (!addedToInt) {
            interiorTotal.count++
            interiorTotal.value += projectValue
            addedToInt = true
          }
          if (interiorStats[picName] !== undefined) {
            interiorStats[picName].count += 1
            interiorStats[picName].value += projectValue
            interiorStats[picName].projects.push(clientName)
          }
        }
      })
    }
  })

  return {
    architecture: {
      data: toChartData(archStats, archTotal),
      totalCount: archTotal.count,
      totalValue: archTotal.value,
    },
    civil: {
      data: toChartData(civilStats, civilTotal),
      totalCount: civilTotal.count,
      totalValue: civilTotal.value,
    },
    interior: {
      data: toChartData(interiorStats, interiorTotal),
      totalCount: interiorTotal.count,
      totalValue: interiorTotal.value,
    },
  }
}
