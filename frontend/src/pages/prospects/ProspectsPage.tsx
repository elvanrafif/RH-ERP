import type { Prospect } from '@/types'
import { ProspectTable } from './ProspectTable'
import { ProspectForm } from './ProspectForm'
import { ProspectDetailDialog } from './ProspectDetailDialog'
import { useDebounce } from '@/hooks/useDebounce'
import { useProspects } from '@/hooks/useProspects'
import { TablePagination } from '@/components/shared/TablePagination'
import { usePagination } from '@/hooks/usePagination'
import { useTableState } from '@/hooks/useTableState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Instagram } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'

export default function ProspectsPage() {
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
  } = useTableState<Prospect>()

  const debouncedSearch = useDebounce(searchTerm, 500)
  const { prospects: data, isLoading } = useProspects({
    searchTerm: debouncedSearch,
  })
  const {
    page,
    setPage,
    totalItems,
    totalPages,
    paginatedData: paginatedProspects,
  } = usePagination(data, [debouncedSearch])

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        icon={<Instagram className="h-6 w-6 text-slate-800" />}
        title="Prospect Clients"
        description="Track Instagram prospect clients and their consultation progress."
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Prospect
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, instagram, phone..."
              className="pl-9 h-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ProspectTable
          prospects={paginatedProspects}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
        />
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemCount={paginatedProspects.length}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Edit Prospect' : 'Add New Prospect'}
        description={
          editing
            ? 'Update the prospect information below.'
            : 'Fill in the prospect details below.'
        }
        scrollable
        maxWidth="sm:max-w-[600px]"
      >
        <ProspectForm
          key={editing ? editing.id : 'new-prospect'}
          initialData={editing}
          onSuccess={() => setOpen(false)}
        />
      </FormDialog>

      <ProspectDetailDialog
        prospect={viewing}
        open={!!viewing}
        onOpenChange={(isOpen) => !isOpen && handleCloseDetail()}
      />
    </div>
  )
}
