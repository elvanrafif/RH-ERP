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
          <span>Projects:</span>
          <span className="font-bold text-slate-900">{data.count}</span>
        </p>
        <p className="flex justify-between">
          <span>Total Value:</span>
          <span className="font-bold text-slate-900">{formatRupiah(data.value)}</span>
        </p>
        <p className="flex justify-between mt-1 pt-1 border-t border-slate-100">
          <span>Workload Share:</span>
          <span className="font-bold text-blue-600">
            {viewMode === 'count' ? data.countPercentage : data.valuePercentage}%
          </span>
        </p>
      </div>
    </div>
  )
}

interface WorkloadChartProps {
  chartData: WorkloadChartEntry[]
  color: string
  viewMode: 'count' | 'value'
}

export function WorkloadChart({ chartData, color, viewMode }: WorkloadChartProps) {
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
        <BarChart data={chartData} margin={{ top: 25, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
              if (viewMode === 'count') return value
              if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(0)} M`
              if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)} Jt`
              if (value >= 1_000) return `${(value / 1_000).toFixed(0)} Rb`
              return value
            }}
          />
          <Tooltip content={<CustomTooltip viewMode={viewMode} />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey={viewMode === 'count' ? 'count' : 'value'} radius={[4, 4, 0, 0]} maxBarSize={60}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={viewMode === 'count' && entry.isOverload ? '#ef4444' : color}
              />
            ))}
            <LabelList
              dataKey={viewMode === 'count' ? 'displayLabelCount' : 'displayLabelValue'}
              position="top"
              style={{ fill: '#475569', fontSize: 11, fontWeight: 'bold' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
