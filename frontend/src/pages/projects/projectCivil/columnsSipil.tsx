import type { ColumnDef, Row } from '@tanstack/react-table'
import type { Project } from '@/types'
import { Badge } from '@/components/ui/badge'
import {
  Pencil,
  Trash2,
  HardHat,
  Eye,
} from 'lucide-react'
import { RowActions } from '@/components/shared/RowActions'
import { ClientName, formatClientName } from '@/components/shared/ClientName'
import { getCivilRawStatusConfig } from '@/lib/projects/status'
import { ContractInfoCell } from './components/ContractInfoCell'

export const getSipilColumns = (
  onView: (project: Project) => void,
  onEdit: (project: Project) => void,
  onDelete: (project: Project) => void,
  isSuperAdmin = false
): ColumnDef<Project>[] => [
  {
    id: 'no',
    header: '#',
    cell: ({ row }) => (
      <span className="text-slate-400 text-xs tabular-nums">
        {row.index + 1}
      </span>
    ),
  },
  {
    accessorKey: 'client',
    header: 'Project & Client',
    enableSorting: false,
    cell: ({ row }) => {
      const client = row.original.expand?.client

      return (
        <div className="flex flex-col min-w-[250px]">
          <span
            className="font-bold text-sm text-slate-800 line-clamp-1"
            title={client ? formatClientName(client) : 'Client Not Found'}
          >
            {client ? (
              <ClientName
                name={client.company_name}
                salutation={client.salutation}
              />
            ) : (
              'Client Not Found'
            )}
          </span>
        </div>
      )
    },
  },
  {
    id: 'spesifikasi',
    header: 'Specifications',
    cell: ({ row }) => {
      const lt = row.original.luas_tanah || 0
      const lb = row.original.luas_bangunan || 0

      return (
        <div className="flex flex-col gap-1.5 min-w-[90px]">
          <Badge
            variant="outline"
            className="bg-slate-50 max-w-max font-normal text-slate-600 px-1.5 h-5"
          >
            Land: {lt}m²
          </Badge>
          <Badge
            variant="outline"
            className="bg-slate-50 max-w-max font-normal text-slate-600 px-1.5 h-5"
          >
            Building: {lb}m²
          </Badge>
        </div>
      )
    },
  },
  // TEAM (Field PIC + Managed By)
  {
    id: 'pic',
    header: 'Team',
    cell: ({ row }) => {
      const fieldPic = row.original.expand?.vendor?.name
      const managedBy = row.original.expand?.assignee?.name
      return (
        <div className="flex flex-col gap-0.5 min-w-[100px]">
          <span className="text-xs font-medium text-slate-700 truncate max-w-[120px]">
            {fieldPic || '—'}
          </span>
          {managedBy && (
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {managedBy}
            </span>
          )}
        </div>
      )
    },
  },

  // --- COMBINED COLUMN (CONTRACT INFO) ---
  {
    id: 'contract_info',
    accessorFn: (row) => row.end_date ?? '',
    header: 'Contract Info',
    enableSorting: true,
    sortingFn: (rowA: Row<Project>, rowB: Row<Project>) => {
      const a = rowA.original.end_date
        ? new Date(rowA.original.end_date).getTime()
        : 0
      const b = rowB.original.end_date
        ? new Date(rowB.original.end_date).getTime()
        : 0
      return a - b
    },
    cell: ({ row }) => (
      <ContractInfoCell project={row.original} isSuperAdmin={isSuperAdmin} />
    ),
  },

  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const { label, colorClass } = getCivilRawStatusConfig(row.original.status)
      return (
        <Badge
          variant="outline"
          className={`uppercase text-[9px] h-5 px-1.5 ${colorClass}`}
        >
          {label}
        </Badge>
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
              {
                label: 'View Details',
                icon: Eye,
                onClick: () => onView(project),
              },
              {
                label: 'Edit Details',
                icon: Pencil,
                onClick: () => onEdit(project),
              },
              {
                label: 'Delete Project',
                icon: Trash2,
                onClick: () => onDelete(project),
                variant: 'destructive',
                separator: true,
              },
            ]}
          />
        </div>
      )
    },
  },
]
