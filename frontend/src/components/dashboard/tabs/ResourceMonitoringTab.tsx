import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts'
import {
  Loader2,
  HardHat,
  Sofa,
  AlertTriangle,
  PencilRuler,
} from 'lucide-react'
import { formatRupiah } from '@/lib/helpers'

// Batas maksimal proyek per orang sebelum dianggap OVERLOAD
const OVERLOAD_THRESHOLD = 4

// Fungsi Helper untuk meringkas angka uang (contoh: 1.500.000.000 -> 1.5 M)
const formatCompactCurrency = (value: number) => {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)} M`
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)} Jt`
  return `Rp ${value}`
}

// --- KOMPONEN REUSABLE CHART ---
const CustomTooltip = ({ active, payload, label, viewMode }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white border border-slate-200 shadow-md p-3 rounded-md min-w-[180px]">
        <p className="font-semibold text-slate-800 text-sm mb-2 flex items-center justify-between">
          {label}
          {data.isOverload && viewMode === 'count' && (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
        </p>
        <div className="flex flex-col gap-1 text-xs text-slate-600">
          <p className="flex justify-between">
            <span>Projects:</span>{' '}
            <span className="font-bold text-slate-900">{data.count}</span>
          </p>
          <p className="flex justify-between">
            <span>Total Value:</span>{' '}
            <span className="font-bold text-slate-900">
              {formatRupiah(data.value)}
            </span>
          </p>
          <p className="flex justify-between mt-1 pt-1 border-t border-slate-100">
            <span>Workload Share:</span>{' '}
            <span className="font-bold text-blue-600">{data.percentage}%</span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

const WorkloadChart = ({
  chartData,
  color,
  viewMode,
}: {
  chartData: any[]
  color: string
  viewMode: 'count' | 'value'
}) => {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm border-2 border-dashed rounded-lg">
        No ongoing projects found.
      </div>
    )
  }

  return (
    <div className="h-[280px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 25, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />
          <XAxis
            dataKey="name"
            interval={0}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => {
              // Jika sedang mode 'count' (jumlah project), biarkan angka normal
              if (viewMode === 'count') return value

              // Jika mode 'value' (nilai uang), persingkat angkanya
              if (value >= 1000000000)
                return `${(value / 1000000000).toFixed(0)} M`
              if (value >= 1000000) return `${(value / 1000000).toFixed(0)} Jt`
              if (value >= 1000) return `${(value / 1000).toFixed(0)} Rb`

              return value
            }}
          />

          <Tooltip
            content={<CustomTooltip viewMode={viewMode} />}
            cursor={{ fill: '#f8fafc' }}
          />

          <Bar
            dataKey={viewMode === 'count' ? 'count' : 'value'}
            radius={[4, 4, 0, 0]}
            maxBarSize={60}
          >
            {/* Logic Pewarnaan: Merah jika Overload dan sedang di mode 'count' */}
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  viewMode === 'count' && entry.isOverload ? '#ef4444' : color
                }
              />
            ))}
            <LabelList
              dataKey={
                viewMode === 'count' ? 'displayLabelCount' : 'displayLabelValue'
              }
              position="top"
              style={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// --- KOMPONEN UTAMA ---
export function ResourceMonitoringTab() {
  const [viewMode, setViewMode] = useState<'count' | 'value'>('count')

  const { data: workloadData, isLoading } = useQuery({
    queryKey: ['resource-workload-real'],
    queryFn: async () => {
      const users = await pb.collection('users').getFullList()
      const userMap = new Map<string, string>()
      users.forEach((u) => userMap.set(u.id, u.name))

      const projects = await pb.collection('projects').getFullList({
        filter: 'status != "finish"',
      })

      // Update Wadah untuk menyimpan 'count' dan 'value'
      const archStats: Record<string, { count: number; value: number }> = {}
      const civilStats: Record<string, { count: number; value: number }> = {}
      const interiorStats: Record<string, { count: number; value: number }> = {}

      let archTotal = { count: 0, value: 0 }
      let civilTotal = { count: 0, value: 0 }
      let interiorTotal = { count: 0, value: 0 }

      users.forEach((u) => {
        if (u.division === 'arsitektur' || u.division === 'architecture')
          archStats[u.name] = { count: 0, value: 0 }
        if (u.division === 'interior')
          interiorStats[u.name] = { count: 0, value: 0 }
      })

      projects.forEach((p) => {
        const type = p.type
        // PENTING: Sesuaikan nama kolom "nilai_proyek" dengan database Bapak (misal p.value atau p.omzet)
        const projectValue = p.contract_value || p.value || p.total_amount || 0

        if (type === 'civil' || type === 'sipil') {
          civilTotal.count++
          civilTotal.value += projectValue

          const meta = p.meta_data || {}
          let fieldPICs: string[] = []

          if (Array.isArray(meta?.pic_lapangan)) fieldPICs = meta.pic_lapangan
          else if (typeof meta?.pic_lapangan === 'string')
            fieldPICs = [meta.pic_lapangan]

          fieldPICs.forEach((rawName: string) => {
            const picName = rawName.trim()
            if (picName) {
              if (civilStats[picName] === undefined)
                civilStats[picName] = { count: 0, value: 0 }
              civilStats[picName].count += 1
              civilStats[picName].value += projectValue
            }
          })
        } else {
          const assignees = Array.isArray(p.assignee)
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

      const toChartData = (
        stats: Record<string, { count: number; value: number }>,
        totalData: { count: number; value: number }
      ) =>
        Object.entries(stats)
          .map(([name, data]) => {
            const countPercentage =
              totalData.count > 0
                ? ((data.count / totalData.count) * 100).toFixed(0)
                : '0'
            const valuePercentage =
              totalData.value > 0
                ? ((data.value / totalData.value) * 100).toFixed(0)
                : '0'
            return {
              name,
              count: data.count,
              value: data.value,
              percentage:
                viewMode === 'count' ? countPercentage : valuePercentage, // Untuk tooltip
              displayLabelCount: `${data.count} (${countPercentage}%)`,
              displayLabelValue: `${formatCompactCurrency(data.value)}`,
              isOverload: data.count >= OVERLOAD_THRESHOLD,
            }
          })
          .sort((a, b) => b.count - a.count)

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
    },
  })

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center flex-col gap-3 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <p className="text-sm font-medium">
          Analyzing team workload and values...
        </p>
      </div>
    )
  }

  const divisionCards = [
    {
      id: 'architecture',
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
      dataRef: workloadData?.architecture,
    },
    {
      id: 'civil',
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
      dataRef: workloadData?.civil,
    },
    {
      id: 'interior',
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
      dataRef: workloadData?.interior,
    },
  ]

  return (
    <div className="space-y-4">
      {/* HEADER & TOGGLE */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            Capacity & Value Distribution
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Red indicator means overload (≥ {OVERLOAD_THRESHOLD} projects).
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

      {/* GRID KARTU */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {divisionCards.map((card) => (
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
                      ? card.dataRef?.totalCount || 0
                      : formatCompactCurrency(card.dataRef?.totalValue || 0)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <WorkloadChart
                chartData={card.dataRef?.data || []}
                color={card.chartColor}
                viewMode={viewMode}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
