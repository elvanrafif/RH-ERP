import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatRupiah } from '@/lib/helpers'

interface ChartEntry {
  name: string
  value: number
  color: string
  [key: string]: unknown
}

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="bg-white border border-slate-200 shadow-md p-2 rounded-md z-50">
      <p className="font-semibold text-slate-800 text-xs mb-1">{data.name}</p>
      <p className="font-bold text-emerald-600 text-sm">
        {formatRupiah(data.value)}
      </p>
    </div>
  )
}

interface RevenuePieChartProps {
  chartData: ChartEntry[]
}

export function RevenuePieChart({ chartData }: RevenuePieChartProps) {
  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-[120px] flex items-center justify-center text-slate-400 text-xs">
        No paid invoices found.
      </div>
    )
  }

  return (
    <div className="h-[140px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="30%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{ fontSize: '11px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
