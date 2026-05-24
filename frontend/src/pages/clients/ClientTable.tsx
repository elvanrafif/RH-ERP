import type { Client } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Eye, Pencil } from 'lucide-react'
import { RowActions } from '@/components/shared/RowActions'
import { ClientName } from '@/components/shared/ClientName'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableRowsSkeleton } from '@/components/shared/TableSkeleton'
import { getInitials, formatFullPhone, getAvatarUrl } from '@/lib/helpers'
import { countries } from '@/lib/constants/countries'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface ClientTableProps {
  clients: Client[]
  isLoading: boolean
  onView: (client: Client) => void
  onEdit?: (client: Client) => void
}

function PicAvatarStack({ client }: { client: Client }) {
  const picUsers = client.expand?.pic_users ?? []
  if (picUsers.length === 0) return <span className="text-slate-400">—</span>

  const visible = picUsers.slice(0, 3)
  const extra = picUsers.length - visible.length

  return (
    <TooltipProvider>
      <div className="flex -space-x-1.5">
        {visible.map((u) => (
          <Tooltip key={u.id} delayDuration={200}>
            <TooltipTrigger asChild>
              <Avatar className="h-7 w-7 border-2 border-white cursor-default shrink-0 shadow-sm">
                <AvatarImage src={getAvatarUrl(u) || ''} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                  {getInitials(u.name || u.email)}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 text-white">
              {u.name || u.email}
            </TooltipContent>
          </Tooltip>
        ))}
        {extra > 0 && (
          <div className="h-7 w-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-500 font-medium text-[10px] shrink-0">
            +{extra}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
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
        <div className="min-w-[820px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead className="w-[260px]">Client / Company</TableHead>
                <TableHead className="w-[200px]">Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="w-[140px]">Managed By</TableHead>
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
                  <TableRow
                    key={client.id}
                    className="h-14 cursor-pointer"
                    onClick={() => onView(client)}
                  >
                    <TableCell className="text-slate-400 text-xs tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {getInitials(client.company_name)}
                        </div>
                        <ClientName
                          name={client.company_name}
                          salutation={client.salutation}
                          className="font-medium text-slate-900"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-slate-600">{formatFullPhone(client.phone, countries)}</span>
                        {client.email && (
                          <span className="text-xs text-slate-400">{client.email}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {!client.address || client.address.length < 30 ? (
                        <span className="text-slate-600">
                          {client.address || '—'}
                        </span>
                      ) : (
                        <TooltipProvider>
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <span className="truncate max-w-[320px] block cursor-default text-slate-600 hover:text-slate-900 transition-colors">
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
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <PicAvatarStack client={client} />
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RowActions
                        actions={[
                          {
                            label: 'View Details',
                            icon: Eye,
                            onClick: () => onView(client),
                          },
                          ...(onEdit
                            ? [
                                {
                                  label: 'Edit',
                                  icon: Pencil,
                                  onClick: () => onEdit!(client),
                                  separator: true,
                                },
                              ]
                            : []),
                        ]}
                      />
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
