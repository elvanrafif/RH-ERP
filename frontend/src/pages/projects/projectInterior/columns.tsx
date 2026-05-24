import type { ColumnDef } from '@tanstack/react-table'
import type { Project } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Pencil, Trash2, Eye, CalendarClock } from 'lucide-react'
import { RowActions } from '@/components/shared/RowActions'
import { ClientName, formatClientName } from '@/components/shared/ClientName'
import { formatDateShort, getInitials, getAvatarUrl, getRemainingTime } from '@/lib/helpers'

const STATUS_COLORS: Record<string, string> = {
  finish: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  draft_skematik: 'bg-blue-50 text-blue-700 border-blue-200',
  detail_drawing: 'bg-violet-50 text-violet-700 border-violet-200',
}

export const getInteriorColumns = (
  onView: (project: Project) => void,
  onEdit: (project: Project) => void,
  onDelete: (project: Project) => void,
  isSuperAdmin = false
): ColumnDef<Project>[] => [
  {
    id: 'no',
    header: '#',
    cell: ({ row }) => (
      <span className="text-slate-400 text-xs tabular-nums">{row.index + 1}</span>
    ),
  },
  {
    accessorKey: 'client',
    header: 'Client',
    enableSorting: false,
    cell: ({ row }) => {
      const client = row.original.expand?.client
      return (
        <div className="min-w-[220px]">
          <span
            className="font-bold text-sm text-slate-800 line-clamp-1"
            title={client ? formatClientName(client) : 'Client Not Found'}
          >
            {client ? (
              <ClientName name={client.company_name} salutation={client.salutation} />
            ) : (
              'Client Not Found'
            )}
          </span>
          {row.original.meta_data?.area_scope && (
            <span className="text-xs text-violet-600 truncate block max-w-[200px]">
              {row.original.meta_data.area_scope}
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: 'pic',
    header: 'PIC / Vendor',
    cell: ({ row }) => {
      const assignee = row.original.expand?.assignee
      const vendor = row.original.expand?.vendor
      return (
        <div className="flex items-center gap-2 min-w-[140px]">
          <Avatar className="h-6 w-6">
            <AvatarImage src={getAvatarUrl(assignee) || ''} />
            <AvatarFallback className="text-[10px] bg-violet-100 text-violet-700">
              {getInitials(assignee?.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm text-slate-600 truncate max-w-[100px]">
              {assignee?.name || '—'}
            </span>
            {vendor && (
              <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                {vendor.name}
              </span>
            )}
          </div>
        </div>
      )
    },
  },
  {
    id: 'deadline',
    header: 'Deadline',
    cell: ({ row }) => {
      const deadline = row.original.deadline
      return (
        <div className="flex flex-col gap-1 min-w-[110px]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <CalendarClock className="h-3 w-3 text-slate-400 shrink-0" />
            <span>{formatDateShort(deadline) || '—'}</span>
          </div>
          {deadline && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase w-fit leading-none">
              {getRemainingTime(deadline)}
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      const colorClass =
        STATUS_COLORS[status] ?? 'bg-slate-50 text-slate-600 border-slate-200'
      return (
        <div className="flex flex-col gap-1">
          <Badge
            variant="outline"
            className={`uppercase text-[9px] h-5 px-1.5 max-w-max ${colorClass}`}
          >
            {status.replace(/_/g, ' ')}
          </Badge>
          {row.original.is_on_hold && (
            <Badge
              variant="outline"
              className="uppercase text-[9px] h-5 px-1.5 max-w-max bg-orange-50 text-orange-700 border-orange-200"
            >
              ⏸ On Hold
            </Badge>
          )}
        </div>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const project = row.original
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <RowActions
            actions={[
              { label: 'View Details', icon: Eye, onClick: () => onView(project) },
              ...(isSuperAdmin
                ? [
                    { label: 'Edit Details', icon: Pencil, onClick: () => onEdit(project) },
                    {
                      label: 'Delete Project',
                      icon: Trash2,
                      onClick: () => onDelete(project),
                      variant: 'destructive' as const,
                      separator: true,
                    },
                  ]
                : []),
            ]}
          />
        </div>
      )
    },
  },
]
