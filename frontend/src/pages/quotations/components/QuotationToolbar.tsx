import { useAuth } from '@/contexts/AuthContext'
import { DocumentToolbar } from '@/components/filters/DocumentToolbar'
import { SortPopover } from '@/components/shared/SortPopover'
import { QUOTATION_SORT_OPTIONS } from '../quotationSortOptions'
import type { QuotationStatusFilter } from '@/hooks/useQuotationFilters'

interface QuotationToolbarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  filterClient: string
  onClientFilterChange: (val: string) => void
  filterArea: 'all' | 'filled' | 'missing'
  onAreaFilterChange: (val: 'all' | 'filled' | 'missing') => void
  filterStatus: QuotationStatusFilter
  onStatusFilterChange: (val: QuotationStatusFilter) => void
  sortBy: string
  onSortChange: (val: string | null) => void
  onResetFilter: () => void
}

const AREA_FILTER_OPTIONS = [
  { label: 'All Areas', value: 'all' },
  { label: 'Area Filled', value: 'filled' },
  { label: 'Area Missing', value: 'missing' },
]

const STATUS_FILTER_OPTIONS = [
  { label: 'All Status', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Draft', value: 'draft' },
]

export function QuotationToolbar({
  searchTerm,
  onSearchChange,
  filterClient,
  onClientFilterChange,
  filterArea,
  onAreaFilterChange,
  filterStatus,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  onResetFilter,
}: QuotationToolbarProps) {
  const { isSuperAdmin } = useAuth()

  const hasActiveFilter =
    searchTerm !== '' ||
    filterClient !== 'all' ||
    filterArea !== 'all' ||
    filterStatus !== 'all'

  const activeSortValue = sortBy === 'created_desc' ? null : sortBy

  return (
    <DocumentToolbar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by client or quot. number..."
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
      secondFilter={{
        value: filterStatus,
        onChange: onStatusFilterChange as (val: string) => void,
        options: STATUS_FILTER_OPTIONS,
      }}
      sortButton={
        <SortPopover
          options={QUOTATION_SORT_OPTIONS}
          value={activeSortValue}
          onChange={(val) => onSortChange(val ?? 'created_desc')}
        />
      }
    />
  )
}
