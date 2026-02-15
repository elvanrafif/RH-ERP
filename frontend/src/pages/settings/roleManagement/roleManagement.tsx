import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

// UI Components
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Loader2, Plus, ShieldCheck, Pencil, ShieldAlert } from 'lucide-react'
import { RoleForm } from './roleForm'

// Import Sub-Component

export default function RoleManagementPage() {
  const queryClient = useQueryClient()

  // States
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any | null>(null)

  // Fetch Roles
  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles-management'],
    queryFn: async () =>
      await pb.collection('roles').getFullList({ sort: 'name' }),
  })

  // Handlers
  const handleCreate = () => {
    setEditingRole(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (role: any) => {
    setEditingRole(role)
    setIsDialogOpen(true)
  }

  if (isLoading)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    )

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6" /> Role & Access Management
          </h1>
          <p className="text-muted-foreground">
            Configure system roles and define access permissions.
          </p>
        </div>
        <Button onClick={handleCreate} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Add New Role
        </Button>
      </div>

      {/* ROLES TABLE */}
      <div className="bg-white rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Role Name</TableHead>
              <TableHead>Total Permissions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center h-24 text-muted-foreground"
                >
                  No roles found.
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
                      <Pencil className="h-4 w-4 text-slate-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* DIALOG FORM */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Edit Role Permissions' : 'Create New Role'}
            </DialogTitle>
          </DialogHeader>
          <RoleForm
            key={editingRole ? editingRole.id : 'new'}
            initialData={editingRole}
            onSuccess={() => {
              setIsDialogOpen(false)
              queryClient.invalidateQueries({ queryKey: ['roles-management'] })
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
