import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { useDebounce } from '@/hooks/useDebounce'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

// Import Modular Components
import { InvoiceToolbar } from './components/InvoiceToolbar'
import { InvoiceTable } from './components/InvoiceTable'
import { InvoiceCreateDialog } from './components/InvoiceCreateDialog'

export default function InvoicesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // STATE SEARCH, FILTER & PAGINATION
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClient, setFilterClient] = useState('all')
  const [activeTab, setActiveTab] = useState('all')

  // State Halaman (Default 1)
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(searchTerm, 500)

  // RESET HALAMAN KE 1 JIKA FILTER BERUBAH
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filterClient, activeTab])

  // 1. FETCH CLIENTS
  const { data: clients } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () =>
      await pb.collection('clients').getFullList({ sort: 'company_name' }),
  })

  // 2. FETCH INVOICES (WITH PAGINATION)
  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ['invoices', page, debouncedSearch, filterClient, activeTab], // Tambahkan 'page' ke key
    queryFn: async () => {
      const filters = []

      if (debouncedSearch)
        filters.push(
          `title ~ "${debouncedSearch}" || invoice_number ~ "${debouncedSearch}"`
        )
      if (filterClient && filterClient !== 'all')
        filters.push(`client_id = "${filterClient}"`)
      if (activeTab !== 'all') filters.push(`type = "${activeTab}"`)

      const filterString = filters.length > 0 ? filters.join(' && ') : ''

      // Ganti getFullList menjadi getList(page, perPage, options)
      return await pb.collection('invoices').getList(page, 50, {
        sort: '-created',
        expand: 'client_id',
        filter: filterString,
      })
    },
    // Agar tidak flickering saat ganti halaman (opsional, tergantung versi react-query)
    placeholderData: (previousData) => previousData,
  })

  const handleResetFilter = () => {
    setSearchTerm('')
    setFilterClient('all')
    setPage(1) // Reset page juga
  }

  return (
    <div className="p-8 pt-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">
            Kelola tagihan Design, Sipil, dan Interior.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Buat Invoice Baru
        </Button>
      </div>

      {/* FILTER & TOOLBAR */}
      <InvoiceToolbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterClient={filterClient}
        onClientFilterChange={setFilterClient}
        onResetFilter={handleResetFilter}
        clients={clients || []}
      />

      {/* TABLE LIST (WITH PAGINATION PROPS) */}
      <InvoiceTable
        invoices={invoiceData?.items || []} // Ambil array items dari result pagination
        isLoading={isLoading}
        // Props Pagination
        page={page}
        totalPages={invoiceData?.totalPages || 1}
        totalItems={invoiceData?.totalItems || 0}
        onPageChange={setPage}
      />

      {/* MODAL CREATE */}
      <InvoiceCreateDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        clients={clients || []}
      />
    </div>
  )
}
