import { formatRupiah } from '@/lib/helpers'

interface ExpandedClient {
  company_name?: string
  name?: string
}

interface QuotationListItem {
  id: string
  quotation_number?: string
  total_price?: number
  expand?: {
    project_id?: { expand?: { client_id?: ExpandedClient } }
    client_id?: ExpandedClient
  }
}

interface TopQuotationsListProps {
  quotations: QuotationListItem[]
}

function getClientName(q: QuotationListItem): string {
  const nested = q.expand?.project_id?.expand?.client_id
  const direct = q.expand?.client_id
  return (
    nested?.company_name ||
    nested?.name ||
    direct?.company_name ||
    direct?.name ||
    'Unknown Client'
  )
}

export function TopQuotationsList({ quotations }: TopQuotationsListProps) {
  if (!quotations || quotations.length === 0) {
    return (
      <div className="h-[150px] flex items-center justify-center text-slate-400 text-xs">
        No paid quotations found in this period.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {quotations.map((q, idx) => (
        <div
          key={q.id}
          className="flex items-center justify-between p-2.5 bg-purple-50/30 rounded-lg border border-purple-100/50"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-7 w-7 shrink-0 rounded-full bg-white border border-purple-100 flex items-center justify-center font-bold text-purple-600 text-[10px] shadow-sm">
              #{idx + 1}
            </div>
            <div className="truncate">
              <p className="text-sm font-bold text-slate-800 truncate">{getClientName(q)}</p>
              <span className="text-[9px] text-slate-400 font-mono">
                {q.quotation_number || 'QUO-XXX'}
              </span>
            </div>
          </div>
          <div className="text-right font-bold text-purple-700 text-sm pl-2 shrink-0">
            {formatRupiah(q.total_price || 0)}
          </div>
        </div>
      ))}
    </div>
  )
}
