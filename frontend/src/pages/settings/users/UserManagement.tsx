import { useState, useMemo } from 'react'
import type { User } from '@/types'
import { useUserManagement } from '@/hooks/useUserManagement'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, UserCog, Search } from 'lucide-react'
import { UserForm } from './components/UserForm'
import { UserList } from './components/UserList'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'
import { PageTableSkeleton } from '@/components/shared/TableSkeleton'

export default function UserManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { users, isLoading } = useUserManagement()

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users
    const q = searchTerm.toLowerCase()
    return users?.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
    )
  }, [users, searchTerm])

  const handleCreate = () => {
    setEditingUser(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsDialogOpen(true)
  }

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        icon={<UserCog className="h-6 w-6" />}
        title="User Management"
        description="Manage employee accounts, roles, and divisions."
        action={
          <Button onClick={handleCreate} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        }
      />

      {/* CONTENT CARD */}
      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        {/* INTEGRATED TOOLBAR */}
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or email..."
              className="pl-9 h-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-4">
            <PageTableSkeleton />
          </div>
        ) : (
          <UserList users={filteredUsers} onEdit={handleEdit} />
        )}
      </div>

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <UserForm
          initialData={editingUser}
          onSuccess={() => setIsDialogOpen(false)}
        />
      </FormDialog>
    </div>
  )
}
