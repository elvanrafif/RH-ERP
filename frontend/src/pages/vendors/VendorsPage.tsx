import { useState, useEffect } from 'react'
import type { Vendor } from '@/types'
import { VendorTable } from './VendorTable'
import { VendorForm } from './VendorForm'
import { VendorDetailDialog } from './VendorDetailDialog'
import { useDebounce } from '@/hooks/useDebounce'
import { useVendors } from '@/hooks/useVendors'
import { TablePagination } from '@/components/shared/TablePagination'

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

const PAGE_SIZE = 15

export default function VendorsPage() {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [projectTypeFilter, setProjectTypeFilter] = useState<'civil' | 'interior' | ''>('')
  const [page, setPage] = useState(1)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null)

  const debouncedSearch = useDebounce(searchTerm, 500)

  const { vendors: data, isLoading } = useVendors({
    searchTerm: debouncedSearch,
    projectType: projectTypeFilter,
  })

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, projectTypeFilter])

  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / PAGE_SIZE)
  const paginatedVendors = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCreate = () => {
    setEditingVendor(null)
    setOpen(true)
  }

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setOpen(true)
  }

  const handleView = (vendor: Vendor) => {
    setViewingVendor(vendor)
  }

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        icon={<Users2 className="h-6 w-6 text-slate-800" />}
        title="Vendors & Rekanan"
        description="Kelola data vendor, rekanan, dan mandor untuk proyek sipil dan interior."
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Vendor
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau nomor HP..."
              className="pl-9 h-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={projectTypeFilter}
            onValueChange={(val) => setProjectTypeFilter(val as typeof projectTypeFilter)}
          >
            <SelectTrigger className="w-[160px] h-9 bg-white">
              <SelectValue placeholder="Semua Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Semua Project</SelectItem>
              <SelectItem value="civil">Sipil</SelectItem>
              <SelectItem value="interior">Interior</SelectItem>
            </SelectContent>
          </Select>
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
        title={editingVendor ? 'Edit Vendor' : 'Tambah Vendor Baru'}
        description={
          editingVendor
            ? 'Perbarui informasi vendor di bawah ini.'
            : 'Isi detail vendor baru di bawah ini.'
        }
      >
        <VendorForm
          key={editingVendor ? editingVendor.id : 'new-vendor'}
          initialData={editingVendor}
          onSuccess={() => setOpen(false)}
        />
      </FormDialog>

      <VendorDetailDialog
        vendor={viewingVendor}
        open={!!viewingVendor}
        onOpenChange={(isOpen) => !isOpen && setViewingVendor(null)}
      />
    </div>
  )
}
