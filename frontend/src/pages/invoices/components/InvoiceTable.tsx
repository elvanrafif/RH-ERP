import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  FolderOpen,
  ArrowRight,
  ChevronLeft,
  ChevronRight, // Icon Navigasi
} from 'lucide-react'
import { MaskingTextByInvoiceType } from '@/lib/masking'
import { cn } from '@/lib/utils'
import { formatRupiah } from '@/lib/helpers'

const getTypeBadge = (type: string) => {
  const text = MaskingTextByInvoiceType(type)

  const colorMap: Record<string, string> = {
    design: 'bg-blue-50 text-blue-700 border-blue-200',
    sipil: 'bg-amber-50 text-amber-700 border-amber-200',
    interior: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }

  return (
    <Badge variant="outline" className={cn(colorMap[type])}>
      {text}
    </Badge>
  )
}

// Interface Props Updated
interface InvoiceTableProps {
  invoices: any[]
  isLoading: boolean
  // Pagination Props
  page?: number
  totalPages?: number
  totalItems?: number
  onPageChange?: (page: number) => void
}

export function InvoiceTable({
  invoices,
  isLoading,
  // Default values
  page = 1,
  totalPages = 1,
  totalItems = 0,
  onPageChange,
}: InvoiceTableProps) {
  return (
    <div className="space-y-4">
      {/* WRAPPER TABLE */}
      <div className="rounded-md border bg-white w-full overflow-x-auto shadow-sm">
        <div className="min-w-[1000px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">No. Invoice</TableHead>
                <TableHead className="w-[300px]">Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Specification</TableHead>
                <TableHead className="text-center">Active Termin</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : invoices?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-60">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="bg-slate-50 p-4 rounded-full mb-3">
                        <FolderOpen className="h-8 w-8 text-slate-400" />
                      </div>
                      <p>Tidak ada invoice ditemukan.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                invoices?.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {inv.invoice_number}
                    </TableCell>
                    <TableCell>
                      {inv.expand?.client_id?.company_name || '-'}
                    </TableCell>
                    <TableCell>{getTypeBadge(inv.type)}</TableCell>
                    <TableCell className="font-medium">
                      {inv.project_area ? (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            {inv.type === 'design' && inv.project_area > 0 && (
                              <Badge
                                variant="outline"
                                className="bg-slate-50 font-normal text-slate-600 px-1.5 h-5"
                              >
                                {inv.project_area}m²
                              </Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {inv.active_termin}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-700">
                      {formatRupiah(inv.total_amount || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/invoices/${inv.id}`}>
                          <ArrowRight className=" h-3 w-3" />
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
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="text-sm text-slate-500">
            Menampilkan <strong>{invoices.length}</strong> dari{' '}
            <strong>{totalItems}</strong> data. (Halaman {page} dari{' '}
            {totalPages})
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
