import type { Prospect } from '@/types'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Pencil, Eye } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableRowsSkeleton } from '@/components/shared/TableSkeleton'
import { formatDateTime, formatTimeUntil } from '@/lib/helpers'

interface ProspectTableProps {
  prospects: Prospect[]
  isLoading: boolean
  onView: (prospect: Prospect) => void
  onEdit: (prospect: Prospect) => void
}

export function ProspectTable({
  prospects,
  isLoading,
  onView,
  onEdit,
}: ProspectTableProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 min-h-0 [&>div]:h-full">
        <Table className="min-w-[960px]">
          <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="min-w-[40px] w-[40px]">#</TableHead>
              <TableHead className="min-w-[130px]">Instagram</TableHead>
              <TableHead className="min-w-[180px]">Client</TableHead>
              <TableHead className="min-w-[120px]">Status</TableHead>
              <TableHead className="min-w-[110px]">Needs</TableHead>
              <TableHead className="min-w-[150px]">Details</TableHead>
              <TableHead className="min-w-[160px]">Meeting Schedule</TableHead>
              <TableHead className="min-w-[52px] w-[52px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRowsSkeleton columns={8} rows={8} />
            ) : prospects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState title="No prospects found." />
                </TableCell>
              </TableRow>
            ) : (
              prospects.map((prospect, index) => (
                <TableRow
                  key={prospect.id}
                  className="cursor-pointer hover:bg-slate-50/80"
                  onClick={() => onView(prospect)}
                >
                  <TableCell className="text-muted-foreground text-xs">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-slate-900">
                      {prospect.instagram ? `@${prospect.instagram}` : '—'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-900">
                      {prospect.client_name || '—'}
                      {prospect.phone && (
                        <span className="mx-1.5 text-slate-300">|</span>
                      )}
                      <span className="text-slate-500">{prospect.phone}</span>
                    </div>
                    {prospect.address && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {prospect.address}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs capitalize whitespace-nowrap">
                      {prospect.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {prospect.needs?.length ? prospect.needs.join(', ') : '—'}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const parts = [
                        prospect.land_size ? `${prospect.land_size} m²` : null,
                        prospect.floor ? `${prospect.floor} Lt` : null,
                        prospect.renovation_type ?? null,
                      ].filter(Boolean)
                      return parts.length ? (
                        <span className="text-xs text-slate-600">
                          {parts.join(' · ')}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(prospect.meeting_schedule)}
                    </div>
                    {(() => {
                      const t = formatTimeUntil(prospect.meeting_schedule)
                      if (!t) return null
                      return (
                        <div
                          className={`text-xs font-medium mt-0.5 ${t.isOverdue ? 'text-red-500' : 'text-amber-600'}`}
                        >
                          {t.label}
                        </div>
                      )
                    })()}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(prospect)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Detail
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(prospect)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
