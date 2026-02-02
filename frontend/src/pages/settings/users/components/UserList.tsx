import { pb } from "@/lib/pocketbase"
import type { User } from "@/types"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Pencil, Trash2, Shield, Smartphone } from "lucide-react"

interface UserListProps {
    users: User[] | undefined;
    onEdit: (user: User) => void;
    onDelete: (id: string) => void;
}

export function UserList({ users, onEdit, onDelete }: UserListProps) {
    
    // Helpers
    const getInitials = (name?: string) => name ? name.substring(0, 2).toUpperCase() : "??";
    const getAvatar = (user: User) => user.avatar ? pb.files.getUrl(user, user.avatar) : null;
    
    const getDivisionBadge = (div?: string) => {
        switch(div) {
            case 'sipil': return "bg-amber-100 text-amber-800 border-amber-200";
            case 'arsitektur': return "bg-blue-100 text-blue-800 border-blue-200";
            case 'interior': return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case 'management': return "bg-purple-100 text-purple-800 border-purple-200";
            default: return "bg-slate-100 text-slate-800";
        }
    }

    return (
        <div className="bg-white rounded-md border shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50">
                        <TableHead>User</TableHead>
                        {/* UPDATE: Header Kontak */}
                        <TableHead>Kontak (Email / Phone)</TableHead>
                        <TableHead>Divisi</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users?.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                Belum ada user yang terdaftar.
                            </TableCell>
                        </TableRow>
                    ) : (
                        users?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={getAvatar(user) || ""} />
                                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="font-medium text-slate-900">{user.name}</div>
                                    </div>
                                </TableCell>
                                
                                {/* UPDATE: Cell Kontak (Email & Phone Digabung biar rapi) */}
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-slate-700">{user.email}</span>
                                        {user.phone ? (
                                            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                                <Smartphone className="h-3 w-3" />
                                                {user.phone}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-300">-</span>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <Badge variant="outline" className={`uppercase text-[10px] ${getDivisionBadge(user.division)}`}>
                                        {user.division || "No Div"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.role === 'superadmin' ? (
                                        <div className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                                            <Shield className="h-3 w-3" /> Superadmin
                                        </div>
                                    ) : (
                                        <span className="text-xs text-slate-500">Employee</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                                            <Pencil className="h-4 w-4 text-slate-500" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => onDelete(user.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}