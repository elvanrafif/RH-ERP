import { Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableRowsSkeleton } from '@/components/shared/TableSkeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, formatRupiah } from '@/lib/helpers'
import type { PettyCashEntry } from '@/types/pettyCash'

interface PettyCashEntryTableProps {
  entries: PettyCashEntry[]
  isLoading: boolean
  onPreview: (entry: PettyCashEntry) => void
  canEdit?: boolean
  onEdit?: (entry: PettyCashEntry) => void
  onDelete?: (entry: PettyCashEntry) => void
}

export function PettyCashEntryTable({ entries, isLoading, onPreview, canEdit, onEdit, onDelete }: PettyCashEntryTableProps) {
  return (
    <div className="rounded-md border bg-white shadow-sm">
      <div className="min-w-[900px]">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-white shadow-sm"><TableRow className="bg-slate-50/50 hover:bg-slate-50/50"><TableHead className="w-[40px]">#</TableHead><TableHead>Type</TableHead><TableHead>Person</TableHead><TableHead>Amount</TableHead><TableHead>Purpose / Notes</TableHead><TableHead>Receipt</TableHead><TableHead>Date</TableHead>{canEdit && <TableHead>Actions</TableHead>}</TableRow></TableHeader>
          <TableBody>
            {isLoading ? <TableRowsSkeleton rows={4} columns={canEdit ? 8 : 7} /> : entries.length === 0 ? <TableRow><TableCell colSpan={canEdit ? 8 : 7} className="h-52"><EmptyState title="No transactions yet" description="Add an expense or top-up to start tracking this period." /></TableCell></TableRow> : entries.map((entry, index) => (
              <TableRow key={entry.id} className="h-14">
                <TableCell className="text-xs tabular-nums text-slate-400">{index + 1}</TableCell>
                <TableCell><span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-medium ${entry.type === 'expense' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{entry.type === 'expense' ? 'Expense' : 'Top-up'}</span></TableCell>
                <TableCell className="text-slate-700">{entry.person_name || '—'}</TableCell>
                <TableCell className={`font-medium tabular-nums ${entry.type === 'expense' ? 'text-red-700' : 'text-emerald-700'}`}>{entry.type === 'expense' ? '− ' : '+ '}{formatRupiah(entry.amount)}</TableCell>
                <TableCell><div className="text-slate-700">{entry.purpose || '—'}</div>{entry.notes && <div className="mt-0.5 text-xs text-muted-foreground">{entry.notes}</div>}</TableCell>
                <TableCell>{entry.receipt ? <Button type="button" variant="ghost" size="icon" aria-label="Preview receipt" onClick={() => onPreview(entry)}><Eye className="h-4 w-4" /></Button> : '—'}</TableCell>
                <TableCell className="text-slate-600">{formatDate(entry.transaction_date)}</TableCell>
                {canEdit && <TableCell><div className="flex gap-1"><Button type="button" size="icon" variant="ghost" aria-label="Edit transaction" onClick={() => onEdit?.(entry)}><Pencil className="h-4 w-4" /></Button><Button type="button" size="icon" variant="ghost" aria-label="Delete transaction" onClick={() => onDelete?.(entry)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
