import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import { MaskingTextByInvoiceType } from '@/lib/masking'
import { cn } from '@/lib/utils'
import { formatRupiah } from '@/lib/helpers'
import { EmptyState } from '@/components/shared/EmptyState'
import { TablePagination } from '@/components/shared/TablePagination'
import { TableRowsSkeleton } from '@/components/shared/TableSkeleton'

const getTypeBadge = (type: string) => {
  const text = MaskingTextByInvoiceType(type)

  const colorMap: Record<string, string> = {
    design: 'bg-blue-50 text-blue-700 border-blue-200',
    sipil: 'bg-amber-50 text-amber-700 border-amber-200',
    interior: 'bg-violet-50 text-violet-700 border-violet-200',
  }

  return (
    <Badge variant="outline" className={cn(colorMap[type])}>
      {text}
    </Badge>
  )
}

interface InvoiceTableProps {
  invoices: any[]
  isLoading: boolean
  page?: number
  totalPages?: number
  totalItems?: number
  onPageChange?: (page: number) => void
}

export function InvoiceTable({
  invoices,
  isLoading,
  page = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
}: InvoiceTableProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead className="w-[150px]">Invoice No.</TableHead>
                <TableHead className="w-[300px]">Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Specification</TableHead>
                <TableHead className="text-center">Active Termin</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton rows={5} columns={8} />
              ) : invoices?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-60">
                    <EmptyState title="No invoices found." />
                  </TableCell>
                </TableRow>
              ) : (
                invoices?.map((inv: any, index: number) => (
                  <TableRow
                    key={inv.id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors h-14"
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                  >
                    <TableCell className="text-slate-400 text-xs tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {inv.invoice_number}
                    </TableCell>
                    <TableCell>
                      {inv.expand?.client_id?.company_name || '-'}
                    </TableCell>
                    <TableCell>{getTypeBadge(inv.type)}</TableCell>
                    <TableCell className="font-medium">
                      {inv.type === 'design' && inv.project_area > 0 ? (
                        <Badge
                          variant="outline"
                          className="bg-slate-50 font-normal text-slate-600 px-1.5 h-5"
                        >
                          {inv.project_area}m²
                        </Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {inv.active_termin}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-700">
                      {formatRupiah(inv.total_amount || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {onPageChange && (
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemCount={invoices.length}
          isLoading={isLoading}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
