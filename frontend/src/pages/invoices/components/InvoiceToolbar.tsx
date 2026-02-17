import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, Filter } from 'lucide-react'

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
  // Tombol reset hanya muncul jika ada filter yang sedang aktif
  const hasActiveFilter =
    searchTerm !== '' || filterClient !== 'all' || activeTab !== 'all'

  return (
    // Wrapper Utama: Kolom (Atas-Bawah) di Mobile, Baris (Kiri-Kanan) di Desktop
    <div className="flex flex-col sm:flex-row gap-3 w-full items-start sm:items-center">
      {/* 1. SEARCH BAR - Full Width di Mobile, Max-Width di Desktop */}
      <div className="relative w-full sm:max-w-[280px] md:max-w-xs shrink-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Inv. Number or Title..."
          className="pl-9 h-9 w-full bg-white shadow-sm"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* 2. FILTER GROUP - Turun ke bawah di Mobile, Sejajar di Desktop */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {/* PROJECT TYPE FILTER */}
        <div className="flex-1 sm:w-[150px] sm:flex-none">
          <Select value={activeTab} onValueChange={onTabChange}>
            <SelectTrigger className="h-9 bg-white shadow-sm w-full">
              <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground hidden sm:block" />
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="design">Architecture</SelectItem>
              <SelectItem value="sipil">Civil</SelectItem>
              <SelectItem value="interior">Interior</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* CLIENT FILTER */}
        <div className="flex-1 sm:w-[180px] sm:flex-none">
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
