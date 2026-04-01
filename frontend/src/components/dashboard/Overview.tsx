import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { useMonthlyRevenue } from '@/hooks/useMonthlyRevenue'
import { formatRupiah } from '@/lib/helpers'

export function Overview() {
  const { data = [], isLoading } = useMonthlyRevenue()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
        Loading...
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="month"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) =>
            value >= 1_000_000
              ? `${(value / 1_000_000).toFixed(0)}M`
              : `${value}`
          }
        />
        <Tooltip
          formatter={(value) => [formatRupiah(Number(value) || 0), 'Revenue']}
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
