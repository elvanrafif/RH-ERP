import { HardHat, Sofa, PencilRuler, AlertTriangle } from 'lucide-react'
import { WORKLOAD_OVERLOAD_THRESHOLD } from '@/lib/constant'
import { useWorkloadData } from '@/hooks/useWorkloadData'
import { WorkloadChart } from './WorkloadChart'
import { ChartSkeleton } from '@/components/shared/ChartSkeleton'

const DIVISION_CARDS = [
  {
    id: 'architecture' as const,
    title: 'Architecture',
    description: 'Design Team',
    icon: PencilRuler,
    accent: 'border-l-slate-500',
    iconColor: 'text-slate-600',
    iconBg: 'bg-slate-50',
    countColor: 'text-slate-700',
    chartColor: '#334155',
  },
  {
    id: 'civil' as const,
    title: 'Civil Engineering',
    description: 'Field Team',
    icon: HardHat,
    accent: 'border-l-amber-500',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50',
    countColor: 'text-amber-700',
    chartColor: '#d97706',
  },
  {
    id: 'interior' as const,
    title: 'Interior Design',
    description: 'Design Team',
    icon: Sofa,
    accent: 'border-l-emerald-500',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    countColor: 'text-emerald-700',
    chartColor: '#059669',
  },
]

export function ResourceMonitoringTab() {
  const { data: workloadData, isLoading } = useWorkloadData()

  if (isLoading) return <ChartSkeleton />

  return (
    <div className="space-y-5">
      {/* SECTION HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Capacity Distribution
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-red-400" />
            Red bars indicate overload (≥ {WORKLOAD_OVERLOAD_THRESHOLD} projects
            per person)
          </p>
        </div>
      </div>

      {/* DIVISION GRID — 3 cols on large screens */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {DIVISION_CARDS.map((card) => {
          const dataRef = workloadData?.[card.id]
          const Icon = card.icon
          return (
            <div
              key={card.id}
              className={`bg-white rounded-xl border border-slate-200 shadow-sm border-l-4 ${card.accent} overflow-hidden`}
            >
              {/* CARD HEADER */}
              <div className="flex items-center justify-between px-4 md:px-5 pt-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${card.iconBg}`}>
                    <Icon className={`h-4 w-4 ${card.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {card.title}
                    </p>
                    <p className="text-xs text-slate-400">{card.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                    Active
                  </p>
                  <p
                    className={`text-xl font-bold leading-none mt-0.5 ${card.countColor}`}
                  >
                    {dataRef?.totalCount ?? 0}
                  </p>
                </div>
              </div>

              {/* CHART */}
              <div className="px-2 pb-2">
                <WorkloadChart
                  chartData={dataRef?.data ?? []}
                  color={card.chartColor}
                  viewMode="count"
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
