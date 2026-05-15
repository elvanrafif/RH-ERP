import type { ColumnDef } from '@tanstack/react-table'
import type { Client } from '@/types'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2, MapPin } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
// 1. IMPORT TOOLTIP COMPONENTS
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// Fungsi Helper Initials
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export const getColumns = (
  onEdit: (client: Client) => void,
  onDelete: (client: Client) => void
): ColumnDef<Client>[] => [
  {
    accessorKey: 'company_name',
    header: 'Nama Perusahaan / Klien',
    cell: ({ row }) => {
      const client = row.original
      return (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {getInitials(row.getValue('company_name'))}
          </div>
          <div className="font-medium">
            {client.salutation && (
              <span className="text-muted-foreground font-normal mr-1">
                {client.salutation}
              </span>
            )}
            {row.getValue('company_name')}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Telepon',
    cell: ({ row }) => row.getValue('phone') || '-',
  },

  // --- 2. UPDATE BAGIAN ALAMAT DI SINI ---
  {
    accessorKey: 'address',
    header: 'Alamat',
    cell: ({ row }) => {
      const client = row.original
      const address = client.address || '-'
      const mapsLink = client.maps_link

      const addressText =
        address === '-' || address.length < 20 ? (
          <span>{address}</span>
        ) : (
          <TooltipProvider>
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <span className="truncate max-w-[220px] block cursor-default hover:text-slate-900 transition-colors">
                  {address}
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[400px] break-words bg-slate-800 text-white">
                <p>{address}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )

      return (
        <div className="flex items-center gap-1.5">
          {addressText}
          {mapsLink && (
            <TooltipProvider>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 text-white">
                  <p>Open in Google Maps</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )
    },
  },
  // ---------------------------------------

  {
    id: 'actions',
    cell: ({ row }) => {
      const client = row.original

      return (
        <div className="text-right">
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => onEdit(client)}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
]
