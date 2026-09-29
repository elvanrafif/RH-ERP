import { Card, CardContent } from '@/components/ui/card'
import { formatRupiah } from '@/lib/helpers'
import type { PettyCash } from '@/types/pettyCash'
import type { PettyCashBalance } from '@/lib/pettyCash/balance'

interface PettyCashSummaryProps {
  period: PettyCash
  balance: PettyCashBalance
}

export function PettyCashSummary({ period, balance }: PettyCashSummaryProps) {
  const items = [
    { label: 'Initial Balance', value: formatRupiah(period.initial_balance) },
    { label: 'Total Top-up', value: formatRupiah(balance.totalTopup) },
    { label: 'Total Spent', value: formatRupiah(balance.totalSpent) },
    { label: 'Remaining Balance', value: formatRupiah(balance.balance), emphasis: true },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className={`mt-1 text-xl tabular-nums ${item.emphasis ? 'font-bold text-primary' : 'font-semibold text-slate-900'}`}>{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
