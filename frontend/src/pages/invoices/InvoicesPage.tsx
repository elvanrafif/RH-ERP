import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useClients } from '@/hooks/useClients'
import { useInvoices } from '@/hooks/useInvoices'
import { useInvoiceFilters } from '@/hooks/useInvoiceFilters'
import { InvoiceToolbar } from './components/InvoiceToolbar'
import { InvoiceTable } from './components/InvoiceTable'
import { InvoiceCreateDialog } from './components/InvoiceCreateDialog'
import type { CreateInvoicePayload } from '@/hooks/useInvoices'

export default function InvoicesPage() {
  const navigate = useNavigate()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const {
    searchTerm, setSearchTerm,
    filterClient, setFilterClient,
    activeTab, setActiveTab,
    page, setPage,
    resetFilters,
    filters,
  } = useInvoiceFilters()

  const { clients } = useClients()
  const { invoices, isLoading, totalPages, totalItems, createInvoice, isCreating } = useInvoices({
    filters,
    page,
  })

  const handleCreateInvoice = (payload: CreateInvoicePayload) => {
    createInvoice(payload, {
      onSuccess: (data) => navigate(`/invoices/${data.id}`),
    })
  }

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-slate-50/30">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className="flex gap-2 items-center">
            <Receipt className="w-6 h-6" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Invoices</h2>
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
          onResetFilter={resetFilters}
          clients={clients}
        />
      </div>

      {/* TABLE LIST */}
      <div className="flex-1 overflow-hidden relative bg-white/50 rounded-lg border border-slate-200/60 shadow-inner">
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
        clients={clients}
        onSubmit={handleCreateInvoice}
        isSubmitting={isCreating}
      />
    </div>
  )
}
