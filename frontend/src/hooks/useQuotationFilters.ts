import { useState, useEffect } from 'react'
import { useDebounce } from './useDebounce'

export type QuotationStatusFilter = 'all' | 'paid' | 'draft'

export interface QuotationFilters {
  debouncedSearch: string
  filterArea: 'all' | 'filled' | 'missing'
  filterStatus: QuotationStatusFilter
  filterPaymentMonth: string | null
  sortBy: string
}

export function useQuotationFilters() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterArea, setFilterArea] = useState<'all' | 'filled' | 'missing'>('all')
  const [filterStatus, setFilterStatus] = useState<QuotationStatusFilter>('all')
  const [filterPaymentMonth, setFilterPaymentMonth] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('created_desc')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filterArea, filterStatus, filterPaymentMonth, sortBy])

  const resetFilters = () => {
    setSearchTerm('')
    setFilterArea('all')
    setFilterStatus('all')
    setFilterPaymentMonth(null)
    setSortBy('created_desc')
    setPage(1)
  }

  return {
    searchTerm,
    setSearchTerm,
    filterArea,
    setFilterArea,
    filterStatus,
    setFilterStatus,
    filterPaymentMonth,
    setFilterPaymentMonth,
    sortBy,
    setSortBy,
    page,
    setPage,
    resetFilters,
    filters: {
      debouncedSearch,
      filterArea,
      filterStatus,
      filterPaymentMonth,
      sortBy,
    } satisfies QuotationFilters,
  }
}
