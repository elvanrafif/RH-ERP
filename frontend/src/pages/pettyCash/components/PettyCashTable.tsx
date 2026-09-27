import { useNavigate } from 'react-router-dom'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableRowsSkeleton } from '@/components/shared/TableSkeleton'
import { formatDate, formatRupiah } from '@/lib/helpers'
import type { PettyCash } from '@/types/pettyCash'
import type { PettyCashBalance } from '@/lib/pettyCash/balance'

interface PettyCashTableProps {
  periods: PettyCash[]
  balances: Record<string, PettyCashBalance>
  isLoading: boolean
}

export function PettyCashTable({ periods, balances, isLoading }: PettyCashTableProps) {
  const navigate = useNavigate()

  return (
    <div className="rounded-md border bg-white shadow-sm">
      <div className="min-w-[760px]">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="w-[40px]">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Initial Balance</TableHead>
              <TableHead>Remaining Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? <TableRowsSkeleton rows={5} columns={6} /> : periods.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-60"><EmptyState title="No petty cash periods yet" description="Create a petty cash period to start tracking expenses." /></TableCell></TableRow>
            ) : periods.map((period, index) => (
              <TableRow key={period.id} className="h-14 cursor-pointer" onClick={() => navigate(`/petty-cash/${period.id}`)}>
                <TableCell className="text-xs tabular-nums text-slate-400">{index + 1}</TableCell>
                <TableCell className="font-medium text-slate-900">{period.name}</TableCell>
                <TableCell className="tabular-nums text-slate-600">{formatRupiah(period.initial_balance)}</TableCell>
                <TableCell className="tabular-nums font-medium text-slate-700">{formatRupiah(balances[period.id]?.balance ?? period.initial_balance)}</TableCell>
                <TableCell><span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${period.status === 'open' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-100 text-slate-600'}`}>{period.status === 'open' ? 'Open' : 'Closed'}</span></TableCell>
                <TableCell className="text-slate-600">{formatDate(period.created)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
