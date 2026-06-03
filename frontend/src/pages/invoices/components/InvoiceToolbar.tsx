import { useState } from 'react'
import { CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DocumentToolbar } from '@/components/filters/DocumentToolbar'
import { SortPopover } from '@/components/shared/SortPopover'
import { MonthYearPicker } from '@/components/shared/MonthYearPicker'
import { INVOICE_SORT_OPTIONS } from '../invoiceSortOptions'

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
  filterTermin: string
  onTerminFilterChange: (val: string) => void
  filterPaymentMonth: string | null
  onPaymentMonthChange: (val: string | null) => void
  sortBy: string
  onSortChange: (val: string) => void
  onResetFilter: () => void
}

export function InvoiceToolbar({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  filterTermin,
  onTerminFilterChange,
  filterPaymentMonth,
  onPaymentMonthChange,
  sortBy,
  onSortChange,
  onResetFilter,
}: InvoiceToolbarProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)

  const hasActiveFilter =
    searchTerm !== '' ||
    activeTab !== 'all' ||
    filterTermin !== 'all' ||
    filterPaymentMonth !== null

  const selectedMonthDate = filterPaymentMonth
    ? new Date(`${filterPaymentMonth}-01`)
    : undefined

  const handleMonthSelect = (date: Date | undefined) => {
    onPaymentMonthChange(date ? format(date, 'yyyy-MM') : null)
    setCalendarOpen(false)
  }

  return (
    <DocumentToolbar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by client, title, or inv. number..."
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
            options={INVOICE_SORT_OPTIONS}
            value={sortBy === 'created_desc' ? null : sortBy}
            onChange={(val) => onSortChange(val ?? 'created_desc')}
          />
        </>
      }
    />
  )
}
