import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { TrendingUp, CheckCircle, Layers } from 'lucide-react'
import { useProjectStats } from '@/hooks/useProjectStats'
import { formatRupiah } from '@/lib/helpers'
import { PROJECT_TYPE } from '@/lib/constant'
import type { Project } from '@/types'

const DIVISION_CONFIG: Record<string, { label: string; color: string }> = {
  [PROJECT_TYPE.ARCHITECTURE]: { label: 'Architecture', color: '#3b82f6' },
  [PROJECT_TYPE.CIVIL]: { label: 'Civil', color: '#f59e0b' },
  [PROJECT_TYPE.INTERIOR]: { label: 'Interior', color: '#10b981' },
}

const STATUS_LABEL: Record<string, string> = {
  design: 'Design',
  progress: 'Progress',
  done: 'Done',
  finish: 'Finished',
  cancelled: 'Cancelled',
  on_contract: 'On Contract',
  detail_drawing: 'Detail Drawing',
}

const STATUS_COLOR: Record<string, string> = {
  design: 'bg-blue-100 text-blue-700',
  progress: 'bg-amber-100 text-amber-700',
  done: 'bg-emerald-100 text-emerald-700',
  finish: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-600',
  on_contract: 'bg-purple-100 text-purple-700',
  detail_drawing: 'bg-cyan-100 text-cyan-700',
}

function toTitleCase(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

interface KpiProps {
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  accent: string
}
function KpiCard({ label, value, sub, icon, accent }: KpiProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start gap-4 border-l-4 ${accent}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-xl font-bold text-slate-900 mt-1 truncate">
          {value}
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>
      </div>
      <div className="text-slate-300 mt-0.5 shrink-0">{icon}</div>
    </div>
  )
}

function TopProjectRow({ project, rank }: { project: Project; rank: number }) {
  const value = project.value || project.contract_value || 0
  const clientName = project.expand?.client?.company_name ?? '—'
  const divConfig = DIVISION_CONFIG[project.type]
  const statusLabel =
    STATUS_LABEL[project.status] ?? toTitleCase(project.status)
  const statusColor =
    STATUS_COLOR[project.status] ?? 'bg-slate-100 text-slate-600'

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-xs font-bold text-slate-300 w-4 shrink-0 text-center">
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">
          {clientName}
        </p>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: `${divConfig?.color}18`,
              color: divConfig?.color,
            }}
          >
            {divConfig?.label ?? project.type}
          </span>
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>
      </div>
      <span className="text-sm font-semibold text-slate-900 shrink-0">
        {formatRupiah(value)}
      </span>
    </div>
  )
}

export function ProjectValueTab() {
  const { data: stats, isLoading } = useProjectStats()

  const divisionChartData = Object.entries(DIVISION_CONFIG).map(
    ([type, config]) => ({
      name: config.label,
      value: stats?.valueByDivision[type] ?? 0,
      avg: Math.round(stats?.averageValueByType[type] ?? 0),
      count: stats?.typeCount[type] ?? 0,
      color: config.color,
    })
  )

  const totalAvgValue =
    stats && stats.totalCount > 0
      ? Object.values(stats.valueByDivision).reduce((a, b) => a + b, 0) /
        stats.totalCount
      : 0

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400 text-sm">
        Loading...
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* KPI ROW */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
        <KpiCard
          label="Pipeline Value"
          value={formatRupiah(stats?.pipelineValue ?? 0)}
          sub="Active design & progress projects"
          icon={<TrendingUp className="h-5 w-5" />}
          accent="border-l-blue-500"
        />
        <KpiCard
          label="Completed Value"
          value={formatRupiah(stats?.completedValue ?? 0)}
          sub="Total value of finished projects"
          icon={<CheckCircle className="h-5 w-5" />}
          accent="border-l-emerald-500"
        />
        <KpiCard
          label="Average Value"
          value={formatRupiah(Math.round(totalAvgValue))}
          sub={`Across ${stats?.totalCount ?? 0} total projects`}
          icon={<Layers className="h-5 w-5" />}
          accent="border-l-purple-500"
        />
      </div>

      {/* CHART + TOP PROJECTS */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 lg:grid-cols-5">
        {/* Bar Chart */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 md:px-5 pt-4 pb-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">
              Contract Value by Division
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Total contract value grouped by division
            </p>
          </div>
          <div className="p-4">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={divisionChartData} barSize={52}>
                  <XAxis
                    dataKey="name"
                    stroke="#cbd5e1"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#cbd5e1"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) =>
                      v >= 1_000_000_000
                        ? `${(v / 1_000_000_000).toFixed(1)}B`
                        : v >= 1_000_000
                          ? `${(v / 1_000_000).toFixed(0)}M`
                          : `${v}`
                    }
                  />
                  <Tooltip
                    formatter={(value) => [
                      formatRupiah(Number(value) || 0),
                      'Total Value',
                    ]}
                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null
                      const d = payload[0].payload
                      return (
                        <div className="bg-white border border-slate-200 rounded-lg shadow-md p-3 text-xs min-w-[160px]">
                          <p className="font-semibold text-slate-800 mb-2">
                            {d.name}
                          </p>
                          <p className="flex justify-between gap-4 text-slate-600">
                            <span>Total Value</span>
                            <span className="font-semibold text-slate-900">
                              {formatRupiah(d.value)}
                            </span>
                          </p>
                          <p className="flex justify-between gap-4 text-slate-500 mt-1">
                            <span>Avg / Project</span>
                            <span className="font-medium">
                              {formatRupiah(d.avg)}
                            </span>
                          </p>
                          <p className="flex justify-between gap-4 text-slate-500 mt-1">
                            <span>Projects</span>
                            <span className="font-medium">{d.count}</span>
                          </p>
                        </div>
                      )
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {divisionChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Projects */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 md:px-5 pt-4 pb-3 border-b border-slate-100">
            <p className="text-sm font-semibold text-slate-900">
              Top Projects by Value
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Highest contract value
            </p>
          </div>
          <div className="px-4 md:px-5 py-1">
            {(stats?.topProjects ?? []).length === 0 ? (
              <div className="flex h-32 items-center justify-center text-slate-400 text-sm">
                No project data yet
              </div>
            ) : (
              (stats?.topProjects ?? []).map((project, i) => (
                <TopProjectRow
                  key={project.id}
                  project={project}
                  rank={i + 1}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
