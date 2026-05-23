import { DocumentToolbar } from '@/components/filters/DocumentToolbar'

const INVOICE_TYPE_OPTIONS = [
  { label: 'All Types', value: 'all' },
  { label: 'Architecture', value: 'design' },
  { label: 'Civil', value: 'sipil' },
  { label: 'Interior', value: 'interior' },
]

const TERMIN_OPTIONS = [
  { label: 'All Termins', value: 'all' },
  { label: 'Termin 1', value: '1' },
  { label: 'Termin 2', value: '2' },
  { label: 'Termin 3', value: '3' },
  { label: 'Termin 4', value: '4' },
  { label: 'Termin 5', value: '5' },
  { label: 'Termin 6', value: '6' },
]

interface InvoiceToolbarProps {
  activeTab: string
  onTabChange: (val: string) => void
  searchTerm: string
  onSearchChange: (val: string) => void
  filterClient: string
  onClientFilterChange: (val: string) => void
  filterTermin: string
  onTerminFilterChange: (val: string) => void
  onResetFilter: () => void
}

export function InvoiceToolbar({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  filterClient,
  onClientFilterChange,
  filterTermin,
  onTerminFilterChange,
  onResetFilter,
}: InvoiceToolbarProps) {
  const hasActiveFilter =
    searchTerm !== '' ||
    filterClient !== 'all' ||
    activeTab !== 'all' ||
    filterTermin !== 'all'

  return (
    <DocumentToolbar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by client, title, or inv. number..."
      filterClient={filterClient}
      onClientFilterChange={onClientFilterChange}
      onResetFilter={onResetFilter}
      hasActiveFilter={hasActiveFilter}
      typeFilter={{
        value: activeTab,
        onChange: onTabChange,
        options: INVOICE_TYPE_OPTIONS,
      }}
      secondFilter={{
        value: filterTermin,
        onChange: onTerminFilterChange,
        options: TERMIN_OPTIONS,
      }}
    />
  )
}
