import { useState } from 'react'
import type { Vendor } from '@/types'
import { VendorTable } from './VendorTable'
import { VendorForm } from './VendorForm'
import { VendorDetailDialog } from './VendorDetailDialog'
import { useDebounce } from '@/hooks/useDebounce'
import { useVendors } from '@/hooks/useVendors'
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
import { Plus, Search, Users2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'

export default function VendorsPage() {
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
  } = useTableState<Vendor>()

  const [projectTypeFilter, setProjectTypeFilter] = useState<
    'civil' | 'interior' | ''
  >('')

  const debouncedSearch = useDebounce(searchTerm, 500)
  const { vendors: data, isLoading } = useVendors({
    searchTerm: debouncedSearch,
    projectType: projectTypeFilter,
  })
  const {
    page,
    setPage,
    totalItems,
    totalPages,
    paginatedData: paginatedVendors,
  } = usePagination(data, [debouncedSearch, projectTypeFilter])

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        icon={<Users2 className="h-6 w-6 text-slate-800" />}
        title="Vendors & Partners"
        description="Manage vendor, partner, and contractor data for civil and interior projects."
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Vendor
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              className="pl-9 h-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[120px] max-w-[160px]">
            <Select
              value={projectTypeFilter || 'all'}
              onValueChange={(val) =>
                setProjectTypeFilter(
                  val === 'all' ? '' : (val as 'civil' | 'interior')
                )
              }
            >
              <SelectTrigger className="w-full h-9 bg-white">
                <SelectValue placeholder="Semua Project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="civil">Civil</SelectItem>
                <SelectItem value="interior">Interior</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <VendorTable
          vendors={paginatedVendors}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
        />
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemCount={paginatedVendors.length}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Edit Vendor' : 'Add New Vendor'}
        description={
          editing
            ? 'Update the vendor information below.'
            : 'Fill in the vendor details below.'
        }
      >
        <VendorForm
          key={editing ? editing.id : 'new-vendor'}
          initialData={editing}
          onSuccess={() => setOpen(false)}
        />
      </FormDialog>

      <VendorDetailDialog
        vendor={viewing}
        open={!!viewing}
        onOpenChange={(isOpen) => !isOpen && handleCloseDetail()}
      />
    </div>
  )
}
