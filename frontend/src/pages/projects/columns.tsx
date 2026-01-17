import type { ColumnDef } from "@tanstack/react-table"
import type { Project } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { pb } from "@/lib/pocketbase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// --- HELPER FUNCTIONS ---

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
  }).format(val);
}

const getBadgeColor = (type: string) => {
  switch (type) {
    case 'design': return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100";
    case 'sipil': return "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100";
    case 'others': return "bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-100";
    default: return "bg-gray-100 hover:bg-gray-100";
  }
}

const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-100";
      case 'doing': return "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-50";
      case 'review': return "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-50";
      case 'done': return "bg-green-50 text-green-600 border-green-200 hover:bg-green-50";
      default: return "";
    }
}

const getAvatarUrl = (user?: any) => {
    if (!user || !user.avatar) return null;
    return pb.files.getUrl(user, user.avatar);
}

const getInitials = (name?: string) => {
    if (!name) return "??";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}

// --- DEFINISI KOLOM ---

export const getColumns = (
  onEdit: (project: Project) => void,
  onDelete: (project: Project) => void
): ColumnDef<Project>[] => [
  {
    accessorKey: "name",
    header: "Nama Project",
    cell: ({ row }) => {
        const clientName = row.original.expand?.client_id?.company_name || "Unknown Client";
        return (
            <div className="flex flex-col min-w-[200px]">
                <span className="font-semibold text-sm">{row.getValue("name")}</span>
                <span className="text-xs text-muted-foreground">{clientName}</span>
            </div>
        )
    }
  },
  {
    accessorKey: "value",
    header: "Nilai",
    cell: ({ row }) => (
      <div className="font-medium">
        {formatRupiah(row.getValue("value"))}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Tipe",
    cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return (
            <Badge variant="outline" className={`${getBadgeColor(type)} uppercase text-[10px]`}>
                {type}
            </Badge>
        )
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
            <Badge variant="outline" className={`${getStatusColor(status)} uppercase text-[10px]`}>
                {status}
            </Badge>
        )
    }
  },
  {
    accessorKey: "assignee",
    header: "PIC",
    cell: ({ row }) => {
        const assignee = row.original.expand?.assignee;
        return (
            <div className="flex items-center gap-2">
                 <Avatar className="h-6 w-6">
                    <AvatarImage src={getAvatarUrl(assignee) || ""} />
                    <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">
                        {getInitials(assignee?.name)}
                    </AvatarFallback>
                </Avatar>
                <span className="text-sm text-slate-600 truncate max-w-[100px]" title={assignee?.name}>
                    {assignee?.name || "-"}
                </span>
            </div>
        )
    }
  },
  {
    accessorKey: "deadline",
    header: "Deadline",
    cell: ({ row }) => {
        const dateStr = row.getValue("deadline") as string;
        if (!dateStr) return <span className="text-slate-400 text-xs">-</span>;
        
        return (
            <div className="text-sm">
                {new Date(dateStr).toLocaleDateString('id-ID', { 
                    day: 'numeric', month: 'short', year: 'numeric' 
                })}
            </div>
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
            <DropdownMenuItem onClick={() => onEdit(project)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Detail
            </DropdownMenuItem>
            
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