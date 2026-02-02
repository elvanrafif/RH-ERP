import type { ColumnDef } from "@tanstack/react-table"
import type { Project } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2, CalendarRange, HardHat, Eye, ArrowRight } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { formatDate, formatRupiah } from "@/lib/helpers"

export const getSipilColumns = (
  onView: (project: Project) => void,
  onEdit: (project: Project) => void,
  onDelete: (project: Project) => void
): ColumnDef<Project>[] => [
  {
    accessorKey: "client",
    header: "Project & Client",
    cell: ({ row }) => {
        const client = row.original.expand?.client;
        const clientName = client?.company_name || "Client Tidak Ditemukan";
        // const contact = client?.contact_person; // Opsional: kalau mau lebih ringkas, hide contact

        return (
            <div className="flex flex-col min-w-[250px]">
                <span className="font-bold text-sm text-slate-800 line-clamp-1" title={clientName}>
                    {clientName}
                </span>
            </div>
        )
    }
  },
  {
    id: "spesifikasi",
    header: "Spesifikasi",
    cell: ({ row }) => {
        const lt = row.original.meta_data?.luas_tanah || 0;
        const lb = row.original.meta_data?.luas_bangunan || 0;

        return (
            <div className="flex flex-col gap-1.5 max-w-[160px]">
                <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="bg-slate-50 font-normal text-slate-600 px-1.5 h-5">
                        LT: {lt}m²
                    </Badge>
                    <Badge variant="outline" className="bg-slate-50 font-normal text-slate-600 px-1.5 h-5">
                        LB: {lb}m²
                    </Badge>
                </div>
            </div>
        )
    }
  },
  // PIC
  {
    id: "pic",
    header: "PIC",
    cell: ({ row }) => {
        const picName = row.original.meta_data?.pic_lapangan;
        return (
            <div className="flex flex-col gap-1.5 min-w-[70px]">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="font-medium truncate max-w-[100px]">
                        {picName || "Belum ada PIC"}
                    </span>
                </div>
            </div>
        )
    }
  },
  
  // --- KOLOM GABUNGAN (CONTRACT INFO) ---
  {
    id: "contract_info",
    accessorKey: "contract_value", // Agar tetap bisa di-sort by value
    header: "Informasi Kontrak",
    cell: ({ row }) => {
        // 1. Ambil Data
        const value = row.original.contract_value;
        const start = row.original.start_date;
        const end = row.original.end_date;

        return (
            <div className="flex flex-col min-w-[140px]">
                
                {/* Baris Atas: Nilai & Badge Status */}
                <div className="flex items-center justify-between pr-2">
                    <span className="font-bold text-sm text-slate-800">
                        {formatRupiah(value || 0)}
                    </span>
                </div>

                {/* Baris Bawah: Tanggal (Durasi) */}
                <div className="flex items-center text-[11px] text-slate-500 bg-slate-50/50 p-1 rounded w-fit">
                    <CalendarRange className="h-3 w-3 mr-1.5 text-slate-400" />
                    {start && end ? (
                        <div className="flex items-center gap-1">
                            <span>{formatDate(start)}</span>
                            <ArrowRight className="h-2.5 w-2.5 text-slate-300" />
                            <span>{formatDate(end)}</span>
                        </div>
                    ) : (
                        <span className="italic text-slate-400">Jadwal belum diset</span>
                    )}
                </div>
            </div>
        )
    }
  },

  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusLabel = status.replace('_', ' ');
      const statusColor = status === 'on_contract' 
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
        : 'bg-slate-100 text-slate-600 border-slate-200';
      return (
        <Badge variant="outline" className={`uppercase text-[9px] h-5 px-1.5 ${statusColor}`}>
          {statusLabel}
        </Badge>
      )
    }
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const project = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(project)}>
              <Eye className="mr-2 h-4 w-4" /> Lihat Detail
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Detail
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
                onClick={() => onDelete(project)} 
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Hapus Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]