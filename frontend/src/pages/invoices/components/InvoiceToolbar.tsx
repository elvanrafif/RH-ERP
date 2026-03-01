import { DocumentToolbar } from '@/components/filters/DocumentToolbar'

const INVOICE_TYPE_OPTIONS = [
  { label: 'All Types', value: 'all' },
  { label: 'Architecture', value: 'design' },
  { label: 'Civil', value: 'sipil' },
  { label: 'Interior', value: 'interior' },
]

interface InvoiceToolbarProps {
  activeTab: string
  onTabChange: (val: string) => void
  searchTerm: string
  onSearchChange: (val: string) => void
  filterClient: string
  onClientFilterChange: (val: string) => void
  onResetFilter: () => void
  clients: any[]
}

export function InvoiceToolbar({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  filterClient,
  onClientFilterChange,
  onResetFilter,
  clients,
}: InvoiceToolbarProps) {
  const hasActiveFilter = searchTerm !== '' || filterClient !== 'all' || activeTab !== 'all'

  return (
    <DocumentToolbar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search Inv. Number or Title..."
      filterClient={filterClient}
      onClientFilterChange={onClientFilterChange}
      onResetFilter={onResetFilter}
      clients={clients}
      hasActiveFilter={hasActiveFilter}
      typeFilter={{ value: activeTab, onChange: onTabChange, options: INVOICE_TYPE_OPTIONS }}
    />
  )
}
