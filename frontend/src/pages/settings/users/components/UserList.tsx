import { pb } from '@/lib/pocketbase'
import type { User } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Shield,
  Smartphone,
  MoreHorizontal,
  Pencil,
  UserCog,
} from 'lucide-react'

interface UserListProps {
  users: User[] | undefined
  onEdit: (user: User) => void
}

export function UserList({ users, onEdit }: UserListProps) {
  // Helpers
  const getInitials = (name?: string) =>
    name ? name.substring(0, 2).toUpperCase() : '??'
  const getAvatar = (user: User) =>
    user.avatar ? pb.files.getUrl(user, user.avatar) : null

  const getDivisionBadge = (div?: string) => {
    switch (div?.toLowerCase()) {
      case 'sipil':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'arsitektur':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'interior':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'management':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  return (
    <div className="bg-white rounded-md border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>User</TableHead>
            <TableHead>Contact (Email / Phone)</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>System Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center h-24 text-muted-foreground"
              >
                No users registered yet.
              </TableCell>
            </TableRow>
          ) : (
            users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={getAvatar(user) || ''} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium text-slate-900">
                      {user.name}
                    </div>
                  </div>
                </TableCell>

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
                  <Badge
                    variant="outline"
                    className={`uppercase text-[10px] ${getDivisionBadge(user.division)}`}
                  >
                    {user.division || 'No Div'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {/* UPDATE: Mendukung Relasi RBAC PocketBase nanti atau fallback ke string biasa */}
                  {user?.isSuperAdmin ||
                  (user as any).expand?.roleId?.name?.toLowerCase() ===
                    'superadmin' ? (
                    <div className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                      <Shield className="h-3 w-3" /> Superadmin
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-slate-600">
                      {(user as any).expand?.roleId?.name ||
                        user.role ||
                        'Employee'}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onEdit(user)}
                  >
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4 text-slate-500" />
                  </Button>
                  {/* <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem >
                        <Pencil className="mr-2 h-4 w-4 text-slate-500" />
                        Edit Data
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <UserCog className="mr-2 h-4 w-4 text-slate-500" />
                        Edit Role
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu> */}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
