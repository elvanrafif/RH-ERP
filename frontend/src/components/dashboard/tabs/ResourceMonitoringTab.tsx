import { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HardHat, Sofa, PencilRuler } from 'lucide-react'
import { formatCompactCurrency } from '@/lib/formatting/currency'
import { WORKLOAD_OVERLOAD_THRESHOLD } from '@/lib/constant'
import { useWorkloadData } from '@/hooks/useWorkloadData'
import { WorkloadChart } from './WorkloadChart'
import { ChartSkeleton } from '@/components/shared/ChartSkeleton'

const DIVISION_CARDS = [
  {
    id: 'architecture' as const,
    title: 'Architecture',
    description: 'Design Team Workload',
    icon: <PencilRuler className="h-4 w-4" />,
    theme: {
      bgHeader: 'bg-slate-50/50',
      border: 'border-slate-200',
      text: 'text-slate-700',
      label: 'text-slate-500',
    },
    chartColor: '#334155',
  },
  {
    id: 'civil' as const,
    title: 'Civil Engineering',
    description: 'Field Team Workload',
    icon: <HardHat className="h-4 w-4" />,
    theme: {
      bgHeader: 'bg-amber-50/30',
      border: 'border-amber-100',
      text: 'text-amber-600',
      label: 'text-amber-600/70',
    },
    chartColor: '#d97706',
  },
  {
    id: 'interior' as const,
    title: 'Interior Design',
    description: 'Designer Workload',
    icon: <Sofa className="h-4 w-4" />,
    theme: {
      bgHeader: 'bg-emerald-50/30',
      border: 'border-emerald-100',
      text: 'text-emerald-600',
      label: 'text-emerald-600/70',
    },
    chartColor: '#059669',
  },
]

export function ResourceMonitoringTab() {
  const [viewMode, setViewMode] = useState<'count' | 'value'>('count')
  const { data: workloadData, isLoading } = useWorkloadData()

  if (isLoading) {
    return <ChartSkeleton />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            Capacity & Value Distribution
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Red indicator means overload (≥ {WORKLOAD_OVERLOAD_THRESHOLD}{' '}
            projects).
          </p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
          <Button
            variant="ghost"
            size="sm"
            className={`text-xs px-4 rounded-md transition-all ${viewMode === 'count' ? 'bg-white shadow-sm text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setViewMode('count')}
          >
            Project Count
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`text-xs px-4 rounded-md transition-all ${viewMode === 'value' ? 'bg-white shadow-sm text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setViewMode('value')}
          >
            Project Value (Rp)
          </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {DIVISION_CARDS.map((card) => {
          const dataRef = workloadData?.[card.id]
          return (
            <Card
              key={card.id}
              className="shadow-sm border-slate-200/60 overflow-hidden"
            >
              <CardHeader
                className={`${card.theme.bgHeader} pb-4 border-b ${card.theme.border}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 bg-white border ${card.theme.border} rounded-md shadow-sm ${card.theme.text}`}
                    >
                      {card.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold text-slate-800">
                        {card.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {card.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-semibold ${card.theme.label} uppercase tracking-wider`}
                    >
                      {viewMode === 'count' ? 'Total Project' : 'Total Rp'}
                    </span>
                    <p className="text-lg font-bold text-slate-800 leading-none mt-1">
                      {viewMode === 'count'
                        ? dataRef?.totalCount || 0
                        : formatCompactCurrency(dataRef?.totalValue || 0)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <WorkloadChart
                  chartData={dataRef?.data || []}
                  color={card.chartColor}
                  viewMode={viewMode}
                />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
