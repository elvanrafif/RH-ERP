import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { useDebounce } from '@/hooks/useDebounce'

import { Button } from '@/components/ui/button'
import { Plus, Receipt } from 'lucide-react'

// Import Modular Components
import { InvoiceToolbar } from './components/InvoiceToolbar'
import { InvoiceTable } from './components/InvoiceTable'
import { InvoiceCreateDialog } from './components/InvoiceCreateDialog'

export default function InvoicesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // STATE SEARCH, FILTER & PAGINATION
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClient, setFilterClient] = useState('all')
  const [activeTab, setActiveTab] = useState('all') // Sekarang ini jadi 'filterType'

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
    queryKey: ['invoices', page, debouncedSearch, filterClient, activeTab],
    queryFn: async () => {
      const filters = []

      if (debouncedSearch) {
        filters.push(
          `(title ~ "${debouncedSearch}" || invoice_number ~ "${debouncedSearch}")`
        )
      }
      if (filterClient && filterClient !== 'all') {
        filters.push(`client_id = "${filterClient}"`)
      }
      if (activeTab && activeTab !== 'all') {
        filters.push(`type = "${activeTab}"`)
      }

      const filterString = filters.length > 0 ? filters.join(' && ') : ''

      return await pb.collection('invoices').getList(page, 50, {
        sort: '-created',
        expand: 'client_id',
        filter: filterString,
      })
    },
    placeholderData: (previousData) => previousData,
  })

  const handleResetFilter = () => {
    setSearchTerm('')
    setFilterClient('all')
    setActiveTab('all')
    setPage(1)
  }

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-slate-50/30">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className="flex gap-2 items-center">
            <Receipt className="w-6 h-6" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Invoices
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage billings for Architecture, Civil, and Interior projects.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      {/* FILTER & TOOLBAR */}
      <div className="mb-4 shrink-0">
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
      </div>

      {/* TABLE LIST */}
      <div className="flex-1 overflow-hidden relative bg-white/50 rounded-lg border border-slate-200/60 shadow-inner">
        <InvoiceTable
          invoices={invoiceData?.items || []}
          isLoading={isLoading}
          page={page}
          totalPages={invoiceData?.totalPages || 1}
          totalItems={invoiceData?.totalItems || 0}
          onPageChange={setPage}
        />
      </div>

      {/* MODAL CREATE */}
      <InvoiceCreateDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        clients={clients || []}
      />
    </div>
  )
}
