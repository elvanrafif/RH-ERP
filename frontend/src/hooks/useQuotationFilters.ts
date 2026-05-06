import { useState, useEffect } from 'react'
import { useDebounce } from './useDebounce'

export interface QuotationFilters {
  debouncedSearch: string
  filterClient: string
  filterArea: 'all' | 'filled' | 'missing'
}

export function useQuotationFilters() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClient, setFilterClient] = useState('all')
  const [filterArea, setFilterArea] = useState<'all' | 'filled' | 'missing'>('all')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filterClient, filterArea])

  const resetFilters = () => {
    setSearchTerm('')
    setFilterClient('all')
    setFilterArea('all')
    setPage(1)
  }

  return {
    searchTerm,
    setSearchTerm,
    filterClient,
    setFilterClient,
    filterArea,
    setFilterArea,
    page,
    setPage,
    resetFilters,
    filters: { debouncedSearch, filterClient, filterArea } satisfies QuotationFilters,
  }
}
