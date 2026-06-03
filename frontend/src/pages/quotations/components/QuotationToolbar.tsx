import { useState } from 'react'
import { CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useAuth } from '@/contexts/AuthContext'
import { DocumentToolbar } from '@/components/filters/DocumentToolbar'
import { SortPopover } from '@/components/shared/SortPopover'
import { MonthYearPicker } from '@/components/shared/MonthYearPicker'
import { QUOTATION_SORT_OPTIONS } from '../quotationSortOptions'
import type { QuotationStatusFilter } from '@/hooks/useQuotationFilters'

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

interface QuotationToolbarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  filterClient: string
  onClientFilterChange: (val: string) => void
  filterArea: 'all' | 'filled' | 'missing'
  onAreaFilterChange: (val: 'all' | 'filled' | 'missing') => void
  filterStatus: QuotationStatusFilter
  onStatusFilterChange: (val: QuotationStatusFilter) => void
  filterPaymentMonth: string | null
  onPaymentMonthChange: (val: string | null) => void
  sortBy: string
  onSortChange: (val: string) => void
  onResetFilter: () => void
}

export function QuotationToolbar({
  searchTerm,
  onSearchChange,
  filterClient,
  onClientFilterChange,
  filterArea,
  onAreaFilterChange,
  filterStatus,
  onStatusFilterChange,
  filterPaymentMonth,
  onPaymentMonthChange,
  sortBy,
  onSortChange,
  onResetFilter,
}: QuotationToolbarProps) {
  const { isSuperAdmin } = useAuth()
  const [calendarOpen, setCalendarOpen] = useState(false)

  const hasActiveFilter =
    searchTerm !== '' ||
    filterClient !== 'all' ||
    filterArea !== 'all' ||
    filterStatus !== 'all' ||
    filterPaymentMonth !== null

  const selectedMonthDate = filterPaymentMonth
    ? new Date(`${filterPaymentMonth}-01`)
    : undefined

  const handleMonthSelect = (date: Date | undefined) => {
    onPaymentMonthChange(date ? format(date, 'yyyy-MM') : null)
    setCalendarOpen(false)
  }

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
        <>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-9 text-sm bg-white shadow-sm w-[185px] justify-start text-left font-normal ${
                  filterPaymentMonth
                    ? 'border-primary/50 ring-1 ring-primary/30 text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">
                  {filterPaymentMonth
                    ? format(new Date(`${filterPaymentMonth}-01`), 'MMMM yyyy')
                    : 'Payment month'}
                </span>
                {filterPaymentMonth && (
                  <span
                    role="button"
                    tabIndex={0}
                    className="ml-auto opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onPaymentMonthChange(null)
                    }}
                    onPointerDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <MonthYearPicker
                selected={selectedMonthDate}
                onSelect={handleMonthSelect}
              />
            </PopoverContent>
          </Popover>
          <SortPopover
            options={QUOTATION_SORT_OPTIONS}
            value={activeSortValue}
            onChange={(val) => onSortChange(val ?? 'created_desc')}
          />
        </>
      }
    />
  )
}
