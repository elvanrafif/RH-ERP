import type { ReactNode } from 'react'
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
import { ClientCombobox } from '@/components/forms/ClientCombobox'

interface TypeFilterOption {
  label: string
  value: string
}

interface TypeFilterConfig {
  value: string
  onChange: (val: string) => void
  options: TypeFilterOption[]
}

interface DocumentToolbarProps {
  searchTerm: string
  onSearchChange: (val: string) => void
  searchPlaceholder?: string
  filterClient?: string
  onClientFilterChange?: (val: string) => void
  onResetFilter: () => void
  hasActiveFilter: boolean
  typeFilter?: TypeFilterConfig
  secondFilter?: TypeFilterConfig
  sortButton?: ReactNode
}

export function DocumentToolbar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterClient,
  onClientFilterChange,
  onResetFilter,
  hasActiveFilter,
  typeFilter,
  secondFilter,
  sortButton,
}: DocumentToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full items-start sm:items-center">
      <div className="relative w-full sm:max-w-xs shrink-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-9 h-9 w-full bg-white shadow-sm"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {typeFilter && (
          <div className="flex-1 sm:w-[150px] sm:flex-none">
            <Select
              value={typeFilter.value}
              onValueChange={typeFilter.onChange}
            >
              <SelectTrigger className="h-9 bg-white shadow-sm w-full">
                <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground hidden sm:block" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {typeFilter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {secondFilter && (
          <div className="flex-1 sm:w-[140px] sm:flex-none">
            <Select
              value={secondFilter.value}
              onValueChange={secondFilter.onChange}
            >
              <SelectTrigger className="h-9 bg-white shadow-sm w-full">
                <SelectValue placeholder={secondFilter.options[0]?.label} />
              </SelectTrigger>
              <SelectContent>
                {secondFilter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filterClient !== undefined && onClientFilterChange && (
          <div className="flex-1 sm:w-[180px] sm:flex-none">
            <ClientCombobox
              value={filterClient}
              onChange={onClientFilterChange}
              showAllOption
              className="h-9 bg-white shadow-sm text-sm"
              popoverClassName="w-[260px]"
            />
          </div>
        )}

        {sortButton}

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
