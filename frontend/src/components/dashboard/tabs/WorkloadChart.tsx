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
import { AlertTriangle } from 'lucide-react'
import { formatRupiah } from '@/lib/helpers'
import type { WorkloadChartEntry } from '@/lib/projects/statistics'

const CustomTooltip = ({ active, payload, label, viewMode }: any) => {
  if (!active || !payload?.length) return null
  const data = payload[0].payload as WorkloadChartEntry
  return (
    <div className="bg-white border border-slate-200 shadow-lg p-3 rounded-md w-[260px]">
      <p className="font-semibold text-slate-800 text-sm mb-2 flex items-center justify-between gap-2">
        <span className="truncate">{label}</span>
        {data.isOverload && viewMode === 'count' && (
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
        )}
      </p>
      <div className="flex flex-col gap-1 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>Total value:</span>
          <span className="font-bold text-slate-900">
            {formatRupiah(data.value)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Workload share:</span>
          <span className="font-bold text-blue-600">
            {viewMode === 'count' ? data.countPercentage : data.valuePercentage}
            %
          </span>
        </div>
      </div>
      {data.projects.length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-600">Active projects:</span>
            <span className="font-bold text-slate-900">
              {data.projects.length}
            </span>
          </div>
          <ul className="flex flex-col gap-1">
            {data.projects.map((name, i) => (
              <li
                key={i}
                className="flex items-center gap-1.5 text-xs text-slate-700"
              >
                <span className="h-1 w-1 rounded-full bg-slate-300 shrink-0" />
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

interface WorkloadChartProps {
  chartData: WorkloadChartEntry[]
  color: string
  viewMode: 'count' | 'value'
}

export function WorkloadChart({
  chartData,
  color,
  viewMode,
}: WorkloadChartProps) {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-[180px] flex items-center justify-center text-slate-400 text-sm border-2 border-dashed rounded-lg">
        No ongoing projects found.
      </div>
    )
  }

  return (
    <div className="h-[210px] w-full mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 18, right: 8, left: -28, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f1f5f9"
          />
          <XAxis
            dataKey="name"
            interval={0}
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            domain={
              viewMode === 'count'
                ? [0, (dataMax: number) => dataMax + 2]
                : [0, 'auto']
            }
            tick={{ fontSize: 10, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => {
              if (viewMode === 'count') return value
              if (value >= 1_000_000_000)
                return `${(value / 1_000_000_000).toFixed(0)} M`
              if (value >= 1_000_000)
                return `${(value / 1_000_000).toFixed(0)} Jt`
              if (value >= 1_000) return `${(value / 1_000).toFixed(0)} Rb`
              return value
            }}
          />
          <Tooltip
            content={<CustomTooltip viewMode={viewMode} />}
            cursor={{ fill: '#f8fafc' }}
            wrapperStyle={{ zIndex: 50, overflow: 'visible' }}
          />
          <Bar
            dataKey={viewMode === 'count' ? 'count' : 'value'}
            radius={[3, 3, 0, 0]}
            maxBarSize={44}
          >
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
              style={{ fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
