import { DocumentToolbar } from '@/components/filters/DocumentToolbar'

interface QuotationToolbarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  filterClient: string
  onClientFilterChange: (val: string) => void
  onResetFilter: () => void
  clients: any[]
}

export function QuotationToolbar({
  searchTerm,
  onSearchChange,
  filterClient,
  onClientFilterChange,
  onResetFilter,
  clients,
}: QuotationToolbarProps) {
  const hasActiveFilter = searchTerm !== '' || filterClient !== 'all'

  return (
    <DocumentToolbar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search quotation number..."
      filterClient={filterClient}
      onClientFilterChange={onClientFilterChange}
      onResetFilter={onResetFilter}
      clients={clients}
      hasActiveFilter={hasActiveFilter}
    />
  )
}
