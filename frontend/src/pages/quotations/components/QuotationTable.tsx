import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowRight } from 'lucide-react'
import { formatRupiah } from '@/lib/helpers'
import { EmptyState } from '@/components/shared/EmptyState'
import { TablePagination } from '@/components/shared/TablePagination'
import { TableRowsSkeleton } from '@/components/shared/TableSkeleton'

interface QuotationTableProps {
  quotations: any[]
  isLoading: boolean
  page?: number
  totalPages?: number
  totalItems?: number
  onPageChange?: (page: number) => void
}

export function QuotationTable({
  quotations,
  isLoading,
  page = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
}: QuotationTableProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[140px]">No. Quotation</TableHead>
                <TableHead className="w-[500px]">Client</TableHead>
                <TableHead>Project Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton rows={5} columns={6} />
              ) : quotations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60">
                    <EmptyState title="No quotations found." />
                  </TableCell>
                </TableRow>
              ) : (
                quotations?.map((q: any) => (
                  <TableRow
                    key={q.id}
                    className="cursor-pointer hover:bg-slate-50 transition-colors h-14"
                    onClick={() => navigate(`/quotations/${q.id}`)}
                  >
                    <TableCell className="font-mono text-xs text-slate-500">
                      {q.quotation_number}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {q.expand?.client_id?.company_name || '-'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {q.project_area || '-'} m2
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const status = (q.status || 'draft').toLowerCase()
                        if (status === 'paid') {
                          return (
                            <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-700">
                              Paid
                            </span>
                          )
                        }
                        if (status === 'rejected') {
                          return (
                            <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-red-100 text-red-700">
                              Rejected
                            </span>
                          )
                        }
                        return (
                          <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-slate-100 text-slate-600">
                            Draft
                          </span>
                        )
                      })()}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-700">
                      {formatRupiah(q.total_price || 0)}
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
          itemCount={quotations.length}
          isLoading={isLoading}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
