import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useClients } from '@/hooks/useClients'
import { useQuotations } from '@/hooks/useQuotations'
import { useQuotationFilters } from '@/hooks/useQuotationFilters'
import { QuotationTable } from './components/QuotationTable'
import { QuotationToolbar } from './components/QuotationToolbar'
import { QuotationCreateDialog } from './components/QuotationCreateDialog'
import type { CreateQuotationPayload } from '@/hooks/useQuotations'

export default function QuotationsPage() {
  const navigate = useNavigate()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const {
    searchTerm, setSearchTerm,
    filterClient, setFilterClient,
    page, setPage,
    resetFilters,
    filters,
  } = useQuotationFilters()

  const { clients } = useClients()
  const { quotations, isLoading, totalPages, totalItems, createQuotation, isCreating } =
    useQuotations({ filters, page })

  const handleCreateQuotation = (payload: CreateQuotationPayload) => {
    createQuotation(payload, {
      onSuccess: (data) => navigate(`/quotations/${data.id}`),
    })
  }

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-slate-50/30">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className="flex gap-2 items-center">
            <FileText className="w-6 h-6" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Quotations</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage price quotes and offers for your clients.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Create Quotation
        </Button>
      </div>

      {/* FILTER & TOOLBAR */}
      <div className="mb-4 shrink-0">
        <QuotationToolbar
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
        <QuotationTable
          quotations={quotations}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      </div>

      {/* MODAL CREATE */}
      <QuotationCreateDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        clients={clients}
        onSubmit={handleCreateQuotation}
        isSubmitting={isCreating}
      />
    </div>
  )
}
