import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Client } from '@/types'
import { ClientTable } from './ClientTable'
import { ClientForm } from './ClientForm'
import { useDebounce } from '@/hooks/useDebounce'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'

export default function ClientsPage() {
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 500)

  const { data, isLoading } = useQuery({
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
    mutationFn: (id: string) => pb.collection('clients').delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client deleted successfully')
      setDeleteId(null)
    },
    onError: () => toast.error('Failed to delete client'),
  })

  const handleCreate = () => {
    setEditingClient(null)
    setOpen(true)
  }

  const handleEdit = (client: Client) => {
    setEditingClient(client)
    setOpen(true)
  }

  const handleDeleteClick = (client: Client) => setDeleteId(client.id)

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        icon={<Users className="h-6 w-6 text-slate-800" />}
        title="Clients"
        description="Manage customer data and contact information."
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Client
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
              placeholder="Search name, email, or phone..."
              className="pl-9 h-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ClientTable
          clients={data || []}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editingClient ? 'Edit Client' : 'Add New Client'}
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
        title="Delete Client?"
        description="This action is permanent. Projects linked to this client may lose their reference."
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
