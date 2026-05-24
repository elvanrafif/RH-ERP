import { useState } from 'react'
import type { Client } from '@/types'
import { ClientTable } from './ClientTable'
import { ClientForm } from './ClientForm'
import { ClientDetailDialog } from './ClientDetailDialog'
import { useDebounce } from '@/hooks/useDebounce'
import { useClients } from '@/hooks/useClients'
import { useUsers } from '@/hooks/useUsers'
import { useAuth } from '@/contexts/AuthContext'
import { TablePagination } from '@/components/shared/TablePagination'
import { usePagination } from '@/hooks/usePagination'
import { useTableState } from '@/hooks/useTableState'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Users, Filter } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'
import { cn } from '@/lib/utils'

export default function ClientsPage() {
  const { can } = useAuth()
  const {
    open,
    setOpen,
    editing,
    viewing,
    searchTerm,
    setSearchTerm,
    handleCreate,
    handleEdit,
    handleView,
    handleCloseDetail,
  } = useTableState<Client>()

  const [filterPic, setFilterPic] = useState('all')
  const { users } = useUsers()

  const debouncedSearch = useDebounce(searchTerm, 500)
  const { clients: data, isLoading } = useClients(debouncedSearch, filterPic)
  const {
    page,
    setPage,
    totalItems,
    totalPages,
    paginatedData: paginatedClients,
  } = usePagination(data, [debouncedSearch, filterPic])

  const picActive = filterPic !== 'all'

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

      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, or phone..."
              className="pl-9 h-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative min-w-[140px] max-w-[180px]">
            {picActive && (
              <span className="absolute -top-1 -right-1 z-10 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
            )}
            <Select value={filterPic} onValueChange={setFilterPic}>
              <SelectTrigger
                className={cn(
                  'h-9 bg-white transition-colors',
                  picActive ? 'border-primary/50 ring-1 ring-primary/30 text-primary' : ''
                )}
              >
                <Filter
                  className={cn(
                    'w-3.5 h-3.5 mr-2',
                    picActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <SelectValue placeholder="Filter PIC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All PICs</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ClientTable
          clients={paginatedClients}
          isLoading={isLoading}
          onView={handleView}
          onEdit={can('manage_clients') ? handleEdit : undefined}
        />
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemCount={paginatedClients.length}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Edit Client' : 'Add New Client'}
        description={
          editing
            ? 'Update the client information below.'
            : 'Fill in the complete client details below.'
        }
      >
        <ClientForm
          key={editing ? editing.id : 'new-client'}
          initialData={editing}
          onSuccess={() => setOpen(false)}
        />
      </FormDialog>

      <ClientDetailDialog
        client={viewing}
        open={!!viewing}
        onOpenChange={(isOpen) => !isOpen && handleCloseDetail()}
      />
    </div>
  )
}
