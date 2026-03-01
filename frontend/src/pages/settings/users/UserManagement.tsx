import { useState } from 'react'
import type { User } from '@/types'
import { useUserManagement } from '@/hooks/useUserManagement'
import { Button } from '@/components/ui/button'
import { Plus, UserCog } from 'lucide-react'
import { UserForm } from './components/UserForm'
import { UserList } from './components/UserList'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export default function UserManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const { users, isLoading } = useUserManagement()

  const handleCreate = () => {
    setEditingUser(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsDialogOpen(true)
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="p-4 md:p-8 max-w-6xl">
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

      <UserList users={users} onEdit={handleEdit} />

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
