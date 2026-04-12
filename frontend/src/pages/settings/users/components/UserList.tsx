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
import { EmptyState } from '@/components/shared/EmptyState'

interface UserListProps {
  users: User[] | undefined
  onEdit: (user: User) => void
}

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
      return 'bg-violet-100 text-violet-800 border-violet-200'
    case 'management':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

export function UserList({ users, onEdit }: UserListProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>System Role</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60">
                    <EmptyState title="No users found." />
                  </TableCell>
                </TableRow>
              ) : (
                users?.map((user, index) => (
                  <TableRow key={user.id} className="h-14">
                    <TableCell className="text-slate-400 text-xs tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getAvatar(user) || ''} />
                          <AvatarFallback className="text-xs">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-slate-900">
                          {user.name}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-700">
                          {user.email}
                        </span>
                        {user.phone ? (
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                            <Smartphone className="h-3 w-3" />
                            {user.phone}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
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
                        className="h-8 w-8 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => onEdit(user)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
