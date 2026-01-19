import type { ColumnDef } from "@tanstack/react-table"
import type { Client } from "@/types"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// 1. IMPORT TOOLTIP COMPONENTS
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Fungsi Helper Initials
const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
}

export const getColumns = (
  onEdit: (client: Client) => void,
  onDelete: (client: Client) => void
): ColumnDef<Client>[] => [
  {
    accessorKey: "company_name",
    header: "Nama Perusahaan / Klien",
    cell: ({ row }) => (
        <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {getInitials(row.getValue("company_name"))}
            </div>
            <div className="font-medium">{row.getValue("company_name")}</div>
        </div>
    )
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Telepon",
    cell: ({ row }) => row.getValue("phone") || "-",
  },
  
  // --- 2. UPDATE BAGIAN ALAMAT DI SINI ---
  {
    accessorKey: "address",
    header: "Alamat",
    cell: ({ row }) => {
      const address = row.getValue("address") as string || "-";
      
      // Jika alamat kosong/pendek, tampilkan biasa saja
      if (address === "-" || address.length < 20) {
        return <span>{address}</span>;
      }

      return (
        <TooltipProvider>
          <Tooltip delayDuration={200}> {/* Delay biar ga kedip2 pas lewat mouse */}
            <TooltipTrigger asChild>
              {/* max-w-[200px] membatasi lebar, truncate bikin titik-titik */}
              <span className="truncate max-w-[250px] block cursor-default hover:text-slate-900 transition-colors">
                {address}
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-[400px] break-words bg-slate-800 text-white">
              <p>{address}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  // ---------------------------------------

  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original
 
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(client.email)}>
              Salin Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(client)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Data
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(client)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" /> Hapus Klien
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]