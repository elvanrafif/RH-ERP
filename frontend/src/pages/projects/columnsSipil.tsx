import type { ColumnDef, Row } from '@tanstack/react-table'
import type { Project } from '@/types'
import { Badge } from '@/components/ui/badge'
import {
  Pencil,
  Trash2,
  CalendarRange,
  HardHat,
  Eye,
  ArrowRight,
} from 'lucide-react'
import { RowActions } from '@/components/shared/RowActions'
import { formatDate, formatRupiah, calculateDuration } from '@/lib/helpers'
import { getCivilRawStatusConfig } from '@/lib/projects/status'

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
    cell: ({ row }) => {
      const client = row.original.expand?.client
      const clientName = client?.company_name || 'Client Not Found'
      // const contact = client?.contact_person; // Optional: hide contact for cleaner look

      return (
        <div className="flex flex-col min-w-[250px]">
          <span
            className="font-bold text-sm text-slate-800 line-clamp-1"
            title={clientName}
          >
            {clientName}
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
  // PIC
  {
    id: 'pic',
    header: 'PIC',
    cell: ({ row }) => {
      const picName = row.original.expand?.vendor?.name
      return (
        <div className="flex flex-col gap-1.5 min-w-[70px]">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-medium truncate max-w-[100px]">
              {picName || 'Unassigned'}
            </span>
          </div>
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
    cell: ({ row }) => {
      // 1. Fetch Data
      const value = row.original.contract_value
      const start = row.original.start_date
      const end = row.original.end_date

      const duration = start && end ? calculateDuration(start, end) : ''

      return (
        <div className="flex flex-col min-w-[140px]">
          {/* Top Row: Value — superadmin only */}
          {isSuperAdmin && (
            <div className="flex items-center justify-between pr-2">
              <span className="font-bold text-sm text-slate-800">
                {formatRupiah(value || 0)}
              </span>
            </div>
          )}

          {/* Date Range */}
          <div className="flex items-center text-[11px] text-slate-500 bg-slate-50/50 p-1 rounded w-fit">
            <CalendarRange className="h-3 w-3 mr-1.5 text-slate-400" />
            {start && end ? (
              <div className="flex items-center gap-1">
                <span>{formatDate(start)}</span>
                <ArrowRight className="h-2.5 w-2.5 text-slate-300" />
                <span>{formatDate(end)}</span>
              </div>
            ) : (
              <span className="italic text-slate-400">Schedule not set</span>
            )}
          </div>

          {/* Duration */}
          {duration && (
            <span className="text-[10px] text-slate-600 pl-1 mt-0.5">
              <span className="text-slate-400">Total:</span> {duration}
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
