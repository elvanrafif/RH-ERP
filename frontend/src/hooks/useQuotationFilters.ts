import { useState, useEffect } from 'react'
import { useDebounce } from './useDebounce'

export type QuotationStatusFilter = 'all' | 'paid' | 'draft'

export interface QuotationFilters {
  debouncedSearch: string
  filterClient: string
  filterArea: 'all' | 'filled' | 'missing'
  filterStatus: QuotationStatusFilter
  sortBy: string
}

export function useQuotationFilters() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClient, setFilterClient] = useState('all')
  const [filterArea, setFilterArea] = useState<'all' | 'filled' | 'missing'>('all')
  const [filterStatus, setFilterStatus] = useState<QuotationStatusFilter>('all')
  const [sortBy, setSortBy] = useState('created_desc')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filterClient, filterArea, filterStatus, sortBy])

  const resetFilters = () => {
    setSearchTerm('')
    setFilterClient('all')
    setFilterArea('all')
    setFilterStatus('all')
    setSortBy('created_desc')
    setPage(1)
  }

  return {
    searchTerm,
    setSearchTerm,
    filterClient,
    setFilterClient,
    filterArea,
    setFilterArea,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    page,
    setPage,
    resetFilters,
    filters: {
      debouncedSearch,
      filterClient,
      filterArea,
      filterStatus,
      sortBy,
    } satisfies QuotationFilters,
  }
}
