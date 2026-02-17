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
import { Shield, Smartphone, MoreHorizontal } from 'lucide-react'
import { MaskingTextByDivision } from '@/lib/masking'

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
      case 'civil':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'architecture':
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
    <div className="bg-white rounded-md border shadow-sm overflow-x-auto">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow className="bg-slate-50 whitespace-nowrap">
            <TableHead>User</TableHead>
            <TableHead>Contact (Email / Phone)</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>System Role</TableHead>
            <TableHead className="text-right"></TableHead>
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
              <TableRow key={user.id} className="whitespace-nowrap">
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
                    className={`uppercase text-[10px] ${getDivisionBadge(MaskingTextByDivision(user.division))}`}
                  >
                    {MaskingTextByDivision(user.division) || 'No Div'}
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
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
