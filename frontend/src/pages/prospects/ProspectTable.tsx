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
import { formatDateTime } from '@/lib/helpers'

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
      <div className="flex-1 overflow-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>Instagram</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="w-[120px]">Needs</TableHead>
                <TableHead className="w-[150px]">Meeting Schedule</TableHead>
                <TableHead className="w-[150px]">Survey Schedule</TableHead>
                <TableHead>Result</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton cols={10} rows={8} />
              ) : prospects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10}>
                    <EmptyState message="No prospects found." />
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
                    <TableCell className="font-medium text-sm">
                      {prospect.instagram || '—'}
                    </TableCell>
                    <TableCell className="text-sm">{prospect.client_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {prospect.phone}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs capitalize">
                        {prospect.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {prospect.needs?.length
                        ? prospect.needs.join(', ')
                        : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(prospect.meeting_schedule)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDateTime(prospect.survey_schedule)}
                    </TableCell>
                    <TableCell className="text-sm max-w-[160px] truncate">
                      {prospect.result || '—'}
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
    </div>
  )
}
