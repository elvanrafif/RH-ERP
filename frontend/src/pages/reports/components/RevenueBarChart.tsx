import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import type { BarChartEntry } from '@/lib/invoicing/reportCalculations'

interface RevenueBarChartProps {
  data: BarChartEntry[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const fmt = (v: number) => `Rp ${(v / 1_000_000).toFixed(1)}M`
  return (
    <div className="bg-white rounded-lg border border-border shadow-lg p-3 text-sm min-w-[150px]">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      <p className="text-blue-600">Invoice: {fmt(payload[0]?.value ?? 0)}</p>
      <p className="text-emerald-600">Quotation: {fmt(payload[1]?.value ?? 0)}</p>
    </div>
  )
}

export function RevenueBarChart({ data }: RevenueBarChartProps) {
  const fmtM = (v: number) => `${(v / 1_000_000).toFixed(0)}M`

  const chartData = data.map(d => ({
    ...d,
    placeholderValue: d.isEmpty ? 1 : 0,
  }))

  return (
    <div className="bg-white rounded-lg border border-border shadow-sm p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Revenue per Periode</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={chartData} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtM} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
          <Bar dataKey="invoiceValue" name="Invoice" stackId="a">
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.isEmpty ? 'transparent' : entry.isCurrentPeriod ? '#1e293b' : '#94a3b8'} />
            ))}
          </Bar>
          <Bar dataKey="quotationValue" name="Quotation" stackId="a" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.isEmpty ? 'transparent' : entry.isCurrentPeriod ? '#475569' : '#cbd5e1'} />
            ))}
          </Bar>
          <Bar dataKey="placeholderValue" stackId="a" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.isEmpty ? '#e2e8f0' : 'transparent'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
