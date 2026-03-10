import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Client } from '@/types'
import { getColumns } from './columns'
import { DataTable } from '@/components/ui/data-table'
import { ClientForm } from './ClientForm'
import { useDebounce } from '@/hooks/useDebounce'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'
import { PageTableSkeleton } from '@/components/shared/TableSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'

export default function ClientsPage() {
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 500)

  const { data, isLoading, error } = useQuery({
    queryKey: ['clients', debouncedSearch],
    queryFn: async () => {
      const filterRule = debouncedSearch
        ? `company_name ~ "${debouncedSearch}" || email ~ "${debouncedSearch}" || phone ~ "${debouncedSearch}" || address ~ "${debouncedSearch}"`
        : ''

      return await pb.collection('clients').getFullList<Client>({
        sort: '-created',
        filter: filterRule,
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await pb.collection('clients').delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client data successfully deleted')
      setDeleteId(null)
    },
    onError: () => toast.error('Failed to delete client data'),
  })

  const handleCreate = () => {
    setEditingClient(null)
    setOpen(true)
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setOpen(true)
  }

  const handleDeleteClick = (client: Client) => {
    setDeleteId(client.id)
  }

  const handleConfirmDelete = () => {
    if (deleteId) deleteMutation.mutate(deleteId)
  }

  const columns = useMemo(
    () => getColumns(handleEdit, handleDeleteClick),
    [handleEdit, handleDeleteClick]
  )

  if (error)
    return (
      <div className="p-8 text-red-500">
        Error loading data: {error.message}
      </div>
    )

  return (
    <div className="w-full overflow-x-auto bg-slate-50/50">
      <div className="min-w-[1024px] space-y-4 p-8 pt-6">
        <PageHeader
          icon={<Users className="h-6 w-6 text-slate-800" />}
          title="Database Clients"
          description="Manage customer data and contact information."
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add Client
            </Button>
          }
        />

        {/* SEARCH BAR */}
        <div className="flex items-center space-x-2 bg-white p-1 rounded-md border w-[400px]">
          <Search className="h-4 w-4 ml-2 text-gray-500" />
          <Input
            placeholder="Search name, email, or phone..."
            className="border-none focus-visible:ring-0 shadow-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* CONTENT AREA */}
        {isLoading ? (
          <PageTableSkeleton />
        ) : data?.length === 0 ? (
          <div className="flex items-center justify-center h-60 border rounded-lg bg-white/50">
            <EmptyState
              title="No clients found"
              description="Try changing your search keywords or add a new client."
            />
          </div>
        ) : (
          <div className="bg-white rounded-md border">
            <DataTable columns={columns} data={data || []} />
          </div>
        )}

        <FormDialog
          open={open}
          onOpenChange={setOpen}
          title={editingClient ? 'Edit Client Data' : 'Add New Client'}
          description={
            editingClient
              ? 'Update the client information below.'
              : 'Fill in the complete client details below.'
          }
        >
          <ClientForm
            key={editingClient ? editingClient.id : 'new-client'}
            initialData={editingClient}
            onSuccess={() => setOpen(false)}
          />
        </FormDialog>

        <DeleteConfirmDialog
          open={!!deleteId}
          onOpenChange={(isOpen) => !isOpen && setDeleteId(null)}
          title="Delete Client Data?"
          description="This action is permanent. All projects associated with this client may lose their client name reference."
          onConfirm={handleConfirmDelete}
          isLoading={deleteMutation.isPending}
        />
      </div>
    </div>
  )
}
