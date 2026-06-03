import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useInvoices } from '@/hooks/useInvoices'
import { useInvoiceFilters } from '@/hooks/useInvoiceFilters'
import { InvoiceToolbar } from './components/InvoiceToolbar'
import { InvoiceTable } from './components/InvoiceTable'
import { InvoiceCreateDialog } from './components/InvoiceCreateDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import type { CreateInvoicePayload } from '@/hooks/useInvoices'

export default function InvoicesPage() {
  const navigate = useNavigate()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const {
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    filterTermin,
    setFilterTermin,
    sortBy,
    setSortBy,
    page,
    setPage,
    resetFilters,
    filters,
  } = useInvoiceFilters()

  const {
    invoices,
    isLoading,
    totalPages,
    totalItems,
    createInvoice,
    isCreating,
  } = useInvoices({
    filters,
    page,
  })

  const handleCreateInvoice = (payload: CreateInvoicePayload) => {
    createInvoice(payload, {
      onSuccess: (data) => navigate(`/invoices/${data.id}`),
    })
  }

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        icon={<Receipt className="w-6 h-6" />}
        title="Invoices"
        description="Manage billings for Architecture, Civil, and Interior projects."
        action={
          <Button onClick={() => setIsDialogOpen(true)} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        }
      />

      {/* TABLE LIST */}
      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        {/* INTEGRATED TOOLBAR */}
        <div className="px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <InvoiceToolbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterTermin={filterTermin}
            onTerminFilterChange={setFilterTermin}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onResetFilter={resetFilters}
          />
        </div>
        <InvoiceTable
          invoices={invoices}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      </div>

      {/* MODAL CREATE */}
      <InvoiceCreateDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleCreateInvoice}
        isSubmitting={isCreating}
      />
    </div>
  )
}
