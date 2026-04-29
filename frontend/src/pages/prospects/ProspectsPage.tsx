import { useMemo, useState } from 'react'
import type { Prospect } from '@/types'
import { ProspectTable } from './ProspectTable'
import { ProspectForm } from './ProspectForm'
import { ProspectDetailDialog } from './ProspectDetailDialog'
import { useDebounce } from '@/hooks/useDebounce'
import { useProspects } from '@/hooks/useProspects'
import { TablePagination } from '@/components/shared/TablePagination'
import { usePagination } from '@/hooks/usePagination'
import { useTableState } from '@/hooks/useTableState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Plus, Search, Instagram, CalendarIcon, X } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'
import { PROSPECT_STATUS } from '@/lib/constant'
import { format, parseISO, startOfMonth } from 'date-fns'
import { MonthYearPicker } from '@/components/shared/MonthYearPicker'

export default function ProspectsPage() {
  const {
    open,
    setOpen,
    editing,
    viewing,
    searchTerm,
    setSearchTerm,
    handleCreate,
    handleEdit,
    handleView,
    handleCloseDetail,
  } = useTableState<Prospect>()

  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(undefined)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const debouncedSearch = useDebounce(searchTerm, 500)
  const { prospects: data, isLoading } = useProspects({
    searchTerm: debouncedSearch,
  })

  const filteredData = useMemo(() => {
    return data
      .filter((p) => filterStatus === 'all' || p.status === filterStatus)
      .filter((p) => {
        if (!selectedMonth || !p.created) return true
        const created = parseISO(p.created)
        return (
          created.getFullYear() === selectedMonth.getFullYear() &&
          created.getMonth() === selectedMonth.getMonth()
        )
      })
  }, [data, filterStatus, selectedMonth])

  const {
    page,
    setPage,
    totalItems,
    totalPages,
    paginatedData: paginatedProspects,
  } = usePagination(filteredData, [debouncedSearch, filterStatus, selectedMonth])

  const handleMonthSelect = (date: Date | undefined) => {
    setSelectedMonth(date ? startOfMonth(date) : undefined)
    setCalendarOpen(false)
  }

  const clearMonthFilter = () => setSelectedMonth(undefined)

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        icon={<Instagram className="h-6 w-6 text-slate-800" />}
        title="Prospect Clients"
        description="Track Instagram prospect clients and their consultation progress."
        action={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Add Prospect
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <div className="relative flex-1 sm:max-w-[240px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, instagram, phone..."
              className="pl-9 h-9 bg-white w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger
                className={`h-9 text-sm bg-white shadow-sm w-[200px] ${
                  filterStatus !== 'all'
                    ? 'border-primary/50 ring-1 ring-primary/30 text-primary'
                    : ''
                }`}
              >
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.values(PROSPECT_STATUS).map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterStatus !== 'all' && (
              <span className="absolute -top-1 -right-1 z-10 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
            )}
          </div>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`h-9 text-sm bg-white shadow-sm w-[180px] justify-start text-left font-normal ${
                  selectedMonth
                    ? 'border-primary/50 ring-1 ring-primary/30 text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedMonth
                  ? format(selectedMonth, 'MMMM yyyy')
                  : 'Pick a month'}
                {selectedMonth && (
                  <span
                    role="button"
                    tabIndex={0}
                    className="ml-auto opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      clearMonthFilter()
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
                selected={selectedMonth}
                onSelect={handleMonthSelect}
              />
            </PopoverContent>
          </Popover>
        </div>

        <ProspectTable
          prospects={paginatedProspects}
          isLoading={isLoading}
          onView={handleView}
          onEdit={handleEdit}
        />
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemCount={paginatedProspects.length}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Edit Prospect' : 'Add New Prospect'}
        description={
          editing
            ? 'Update the prospect information below.'
            : 'Fill in the prospect details below.'
        }
        scrollable
        maxWidth="sm:max-w-[600px]"
      >
        <ProspectForm
          key={editing ? editing.id : 'new-prospect'}
          initialData={editing}
          onSuccess={() => setOpen(false)}
        />
      </FormDialog>

      <ProspectDetailDialog
        prospect={viewing}
        open={!!viewing}
        onOpenChange={(isOpen) => !isOpen && handleCloseDetail()}
      />
    </div>
  )
}
