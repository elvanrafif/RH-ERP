import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useRecentTransactions } from '@/hooks/useRecentTransactions'

export function RecentSales() {
  const { data: transactions = [], isLoading } = useRecentTransactions()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2.5 w-28 rounded bg-slate-100" />
              <div className="h-2 w-16 rounded bg-slate-100" />
            </div>
            <div className="h-2.5 w-20 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-slate-400 text-sm">
        No transactions yet
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs bg-slate-100 text-slate-600">{tx.initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 leading-none truncate">{tx.clientName}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {tx.type === 'invoice' ? 'Invoice' : 'Quotation'}
            </p>
          </div>
          <span className="text-sm font-semibold text-emerald-600 shrink-0">
            +{tx.formattedAmount}
          </span>
        </div>
      ))}
    </div>
  )
}
