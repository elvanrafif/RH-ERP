import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowRight } from 'lucide-react'
import { formatRupiah } from '@/lib/helpers'
import { EmptyState } from '@/components/shared/EmptyState'
import { TablePagination } from '@/components/shared/TablePagination'

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
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : quotations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60">
                    <EmptyState title="No quotations found." />
                  </TableCell>
                </TableRow>
              ) : (
                quotations?.map((q: any) => (
                  <TableRow key={q.id}>
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
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/quotations/${q.id}`}>
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </Link>
                      </Button>
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
