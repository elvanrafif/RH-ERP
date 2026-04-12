import type { Client } from '@/types'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { MoreHorizontal, Pencil, Eye } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableRowsSkeleton } from '@/components/shared/TableSkeleton'
import { getInitials } from '@/lib/helpers'

interface ClientTableProps {
  clients: Client[]
  isLoading: boolean
  onView: (client: Client) => void
  onEdit?: (client: Client) => void
}

export function ClientTable({
  clients,
  isLoading,
  onView,
  onEdit,
}: ClientTableProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead className="w-[280px]">Client / Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton rows={5} columns={6} />
              ) : clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60">
                    <EmptyState
                      title="No clients found"
                      description="Try changing your search keywords or add a new client."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client, index) => (
                  <TableRow key={client.id} className="h-14">
                    <TableCell className="text-slate-400 text-xs tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {getInitials(client.company_name)}
                        </div>
                        <span className="font-medium text-slate-900">
                          {client.company_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {client.email || '—'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {client.phone || '—'}
                    </TableCell>
                    <TableCell>
                      {!client.address || client.address.length < 20 ? (
                        <span className="text-slate-600">
                          {client.address || '—'}
                        </span>
                      ) : (
                        <TooltipProvider>
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <span className="truncate max-w-[250px] block cursor-default text-slate-600 hover:text-slate-900 transition-colors">
                                {client.address}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[400px] break-words bg-slate-800 text-white">
                              <p>{client.address}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(client)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          {onEdit && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onEdit(client)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                            </>
                          )}
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
