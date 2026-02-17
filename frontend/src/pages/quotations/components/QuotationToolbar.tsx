import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'

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
    <div className="flex flex-col sm:flex-row gap-3 w-full items-start sm:items-center">
      {/* 1. SEARCH BAR */}
      <div className="relative w-full sm:max-w-[280px] md:max-w-xs shrink-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search quotation number..."
          className="pl-9 h-9 w-full bg-white shadow-sm"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* 2. FILTER GROUP */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {/* CLIENT FILTER */}
        <div className="flex-1 sm:w-[220px] sm:flex-none">
          <Select value={filterClient} onValueChange={onClientFilterChange}>
            <SelectTrigger className="h-9 bg-white shadow-sm w-full">
              <SelectValue placeholder="All Clients" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients?.map((client: any) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* RESET BUTTON */}
        {hasActiveFilter && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            onClick={onResetFilter}
            title="Clear Filters"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
