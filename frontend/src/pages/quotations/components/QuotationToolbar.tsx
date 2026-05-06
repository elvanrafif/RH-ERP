import { useAuth } from '@/contexts/AuthContext'
import { DocumentToolbar } from '@/components/filters/DocumentToolbar'

interface QuotationToolbarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  filterClient: string
  onClientFilterChange: (val: string) => void
  filterArea: 'all' | 'filled' | 'missing'
  onAreaFilterChange: (val: 'all' | 'filled' | 'missing') => void
  onResetFilter: () => void
}

const AREA_FILTER_OPTIONS = [
  { label: 'All Areas', value: 'all' },
  { label: 'Area Filled', value: 'filled' },
  { label: 'Area Missing', value: 'missing' },
]

export function QuotationToolbar({
  searchTerm,
  onSearchChange,
  filterClient,
  onClientFilterChange,
  filterArea,
  onAreaFilterChange,
  onResetFilter,
}: QuotationToolbarProps) {
  const { isSuperAdmin } = useAuth()

  const hasActiveFilter =
    searchTerm !== '' || filterClient !== 'all' || filterArea !== 'all'

  return (
    <DocumentToolbar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search quotation number..."
      filterClient={filterClient}
      onClientFilterChange={onClientFilterChange}
      onResetFilter={onResetFilter}
      hasActiveFilter={hasActiveFilter}
      typeFilter={
        isSuperAdmin
          ? {
              value: filterArea,
              onChange: onAreaFilterChange as (val: string) => void,
              options: AREA_FILTER_OPTIONS,
            }
          : undefined
      }
    />
  )
}
