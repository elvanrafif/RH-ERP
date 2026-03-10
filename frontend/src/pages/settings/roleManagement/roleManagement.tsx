import { useState } from 'react'
import { useRoles } from '@/hooks/useRoles'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, ShieldCheck, ShieldAlert, MoreHorizontal } from 'lucide-react'
import { RoleForm } from './roleForm'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableRowsSkeleton } from '@/components/shared/TableSkeleton'

export default function RoleManagementPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any | null>(null)

  const { roles, isLoading } = useRoles()

  const handleCreate = () => {
    setEditingRole(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (role: any) => {
    setEditingRole(role)
    setIsDialogOpen(true)
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl">
      <PageHeader
        icon={<ShieldCheck className="h-6 w-6" />}
        title="Role & Access Management"
        description="Configure system roles and define access permissions."
        action={
          <Button onClick={handleCreate} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Add New Role
          </Button>
        }
      />

      {/* ROLES TABLE */}
      <div className="bg-white rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Role Name</TableHead>
              <TableHead>Total Permissions</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRowsSkeleton rows={3} columns={3} />
            ) : roles?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-40">
                  <EmptyState
                    title="No roles found."
                    description="Create your first role to manage access permissions."
                  />
                </TableCell>
              </TableRow>
            ) : (
              roles?.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-indigo-500" />
                      {role.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs border font-medium">
                      {Array.isArray(role.permissions)
                        ? role.permissions.length
                        : 0}{' '}
                      Access Granted
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(role)}
                    >
                      <MoreHorizontal className="h-4 w-4 text-slate-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingRole ? 'Edit Role Permissions' : 'Create New Role'}
        maxWidth="sm:max-w-[700px]"
        scrollable
      >
        <RoleForm
          key={editingRole ? editingRole.id : 'new'}
          initialData={editingRole}
          onSuccess={() => setIsDialogOpen(false)}
        />
      </FormDialog>
    </div>
  )
}
