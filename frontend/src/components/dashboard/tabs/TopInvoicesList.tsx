import { formatRupiah } from '@/lib/helpers'

interface TopInvoicesListProps {
  invoices: any[]
}

function getClientName(inv: any): string {
  const nested = inv.expand?.project_id?.expand?.client_id
  const direct = inv.expand?.client_id
  return (
    nested?.company_name ||
    nested?.name ||
    direct?.company_name ||
    direct?.name ||
    'Unknown Client'
  )
}

export function TopInvoicesList({ invoices }: TopInvoicesListProps) {
  if (!invoices || invoices.length === 0) {
    return (
      <div className="h-[100px] flex items-center justify-center text-slate-400 text-xs">
        No data available.
      </div>
    )
  }

  return (
    <>
      {invoices.map((inv, idx) => (
        <div
          key={inv.id}
          className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-6 w-6 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-[10px]">
              #{idx + 1}
            </div>
            <div className="truncate">
              <p className="text-sm font-bold text-slate-800 truncate">{getClientName(inv)}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] text-slate-500 font-mono bg-slate-100 px-1 rounded border border-slate-200">
                  {inv.invoice_number || 'INV-XXX'}
                </span>
                <span className="text-[10px] text-slate-400 capitalize truncate">
                  {inv.type || inv.category || inv.division || 'General'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right font-bold text-emerald-600 text-sm pl-2 shrink-0">
            {formatRupiah(inv.total_amount || inv.amount || 0)}
          </div>
        </div>
      ))}
    </>
  )
}
