import {
  TrendingUp,
  TrendingDown,
  Receipt,
  FileText,
  DollarSign,
} from 'lucide-react'
import { formatRupiah } from '@/lib/helpers'
import type { StatCardData } from '@/lib/invoicing/reportCalculations'

interface RevenueStatCardsProps {
  data: StatCardData
}

function ChangeBadge({ pct }: { pct: number }) {
  const positive = pct >= 0
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? 'text-emerald-600' : 'text-red-600'}`}
    >
      {positive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      {Math.abs(pct)}%
    </span>
  )
}

export function RevenueStatCards({ data }: RevenueStatCardsProps) {
  const cards = [
    {
      label: 'Total Revenue',
      value: data.totalRevenue,
      change: data.totalChange,
      icon: <DollarSign className="h-5 w-5" />,
      bg: 'bg-slate-100 text-slate-700',
    },
    {
      label: 'Active Invoices',
      value: data.invoiceRevenue,
      change: data.invoiceChange,
      icon: <Receipt className="h-5 w-5" />,
      bg: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Quotation Paid',
      value: data.quotationRevenue,
      change: data.quotationChange,
      icon: <FileText className="h-5 w-5" />,
      bg: 'bg-emerald-100 text-emerald-700',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white rounded-lg border border-border shadow-sm p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-md ${card.bg}`}>{card.icon}</div>
            <ChangeBadge pct={card.change} />
          </div>
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">
            {formatRupiah(card.value)}
          </p>
        </div>
      ))}
    </div>
  )
}
