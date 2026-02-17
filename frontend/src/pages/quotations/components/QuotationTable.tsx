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
  console.log('🚀 ~ quotations >>>> ', quotations)
  return (
    <div className="flex flex-col h-full bg-white">
      {/* WRAPPER TABLE */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[140px]">No. Quotation</TableHead>
                <TableHead className="w-[600px]">Client</TableHead>
                <TableHead>Project Area</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead className="text-right w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : quotations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-60">
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
