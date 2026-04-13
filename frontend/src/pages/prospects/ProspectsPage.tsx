import { useState, useEffect } from 'react'
import type { Prospect } from '@/types'
import { ProspectTable } from './ProspectTable'
import { ProspectForm } from './ProspectForm'
import { ProspectDetailDialog } from './ProspectDetailDialog'
import { useDebounce } from '@/hooks/useDebounce'
import { useProspects } from '@/hooks/useProspects'
import { TablePagination } from '@/components/shared/TablePagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Instagram } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'

const PAGE_SIZE = 15

export default function ProspectsPage() {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [editingProspect, setEditingProspect] = useState<Prospect | null>(null)
  const [viewingProspect, setViewingProspect] = useState<Prospect | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 500)

  const { prospects: data, isLoading } = useProspects({
    searchTerm: debouncedSearch,
  })

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / PAGE_SIZE)
  const paginatedProspects = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCreate = () => {
    setEditingProspect(null)
    setOpen(true)
  }

  const handleEdit = (prospect: Prospect) => {
    setEditingProspect(prospect)
    setOpen(true)
  }

  const handleView = (prospect: Prospect) => {
    setViewingProspect(prospect)
  }

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
        title={editingProspect ? 'Edit Prospect' : 'Add New Prospect'}
        description={
          editingProspect
            ? 'Update the prospect information below.'
            : 'Fill in the prospect details below.'
        }
      >
        <ProspectForm
          key={editingProspect ? editingProspect.id : 'new-prospect'}
          initialData={editingProspect}
          onSuccess={() => setOpen(false)}
        />
      </FormDialog>

      <ProspectDetailDialog
        prospect={viewingProspect}
        open={!!viewingProspect}
        onOpenChange={(isOpen) => !isOpen && setViewingProspect(null)}
      />
    </div>
  )
}
