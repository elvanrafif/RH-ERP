import { formatCompactCurrency } from '@/lib/formatting/currency'
import { WORKLOAD_OVERLOAD_THRESHOLD } from '@/lib/constant'

interface StatsRecord {
  count: number
  value: number
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
      }
    })
    .sort((a, b) => b.count - a.count)
}

export function buildWorkloadData(users: any[], projects: any[]): WorkloadData {
  const userMap = new Map<string, string>()
  users.forEach((u) => userMap.set(u.id, u.name))

  const archStats: Record<string, StatsRecord> = {}
  const civilStats: Record<string, StatsRecord> = {}
  const interiorStats: Record<string, StatsRecord> = {}
  let archTotal: StatsRecord = { count: 0, value: 0 }
  let civilTotal: StatsRecord = { count: 0, value: 0 }
  let interiorTotal: StatsRecord = { count: 0, value: 0 }

  users.forEach((u) => {
    if (u.division === 'arsitektur' || u.division === 'architecture')
      archStats[u.name] = { count: 0, value: 0 }
    if (u.division === 'interior') interiorStats[u.name] = { count: 0, value: 0 }
  })

  projects.forEach((p) => {
    const type = p.type
    const projectValue = p.contract_value || p.value || p.total_amount || 0

    if (type === 'civil' || type === 'sipil') {
      civilTotal.count++
      civilTotal.value += projectValue
      const meta = p.meta_data || {}
      const fieldPICs: string[] = Array.isArray(meta?.pic_lapangan)
        ? meta.pic_lapangan
        : typeof meta?.pic_lapangan === 'string'
          ? [meta.pic_lapangan]
          : []
      fieldPICs.forEach((rawName: string) => {
        const picName = rawName.trim()
        if (!picName) return
        if (!civilStats[picName]) civilStats[picName] = { count: 0, value: 0 }
        civilStats[picName].count += 1
        civilStats[picName].value += projectValue
      })
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
        if (type === 'architecture' || type === 'arsitektur') {
          if (!addedToArch) {
            archTotal.count++
            archTotal.value += projectValue
            addedToArch = true
          }
          if (archStats[picName] !== undefined) {
            archStats[picName].count += 1
            archStats[picName].value += projectValue
          }
        } else if (type === 'interior') {
          if (!addedToInt) {
            interiorTotal.count++
            interiorTotal.value += projectValue
            addedToInt = true
          }
          if (interiorStats[picName] !== undefined) {
            interiorStats[picName].count += 1
            interiorStats[picName].value += projectValue
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
