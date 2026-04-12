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
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
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

      {/* CONTENT CARD */}
      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        <div className="flex flex-col h-full bg-white">
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRowsSkeleton rows={3} columns={4} />
                ) : roles?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-60">
                      <EmptyState
                        title="No roles found."
                        description="Create your first role to manage access permissions."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  roles?.map((role, index) => (
                    <TableRow key={role.id} className="h-14">
                      <TableCell className="text-slate-400 text-xs tabular-nums">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-indigo-500 shrink-0" />
                          {role.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs border font-medium">
                          {Array.isArray(role.permissions)
                            ? role.permissions.length
                            : 0}{' '}
                          access granted
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-30 hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={() => handleEdit(role)}
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

      <FormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={editingRole ? 'Edit Role Permissions' : 'Create New Role'}
        maxWidth="md:max-w-[700px]"
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
