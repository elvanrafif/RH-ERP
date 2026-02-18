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
import {
  Loader2,
  FolderOpen,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { formatRupiah } from '@/lib/helpers'

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
      {/* WRAPPER TABLE */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[140px]">No. Quotation</TableHead>
                <TableHead className="w-[500px]">Client</TableHead>
                <TableHead>Project Area</TableHead>
                {/* TAMBAHAN: KOLOM STATUS */}
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  {/* UBAH: colSpan 5 jadi 6 */}
                  <TableCell colSpan={6} className="text-center h-24">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : quotations?.length === 0 ? (
                <TableRow>
                  {/* UBAH: colSpan 5 jadi 6 */}
                  <TableCell colSpan={6} className="text-center h-60">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="bg-slate-50 p-4 rounded-full mb-3">
                        <FolderOpen className="h-8 w-8 text-slate-400" />
                      </div>
                      <p>No quotations found.</p>
                    </div>
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
                    {/* TAMBAHAN: BADGE STATUS */}
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

      {/* FOOTER: PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50/50 shrink-0">
          <div className="text-xs text-slate-500">
            Showing <strong>{quotations.length}</strong> of{' '}
            <strong>{totalItems}</strong> entries (Page {page} of {totalPages})
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages || isLoading}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
