import { useState, useEffect } from 'react'
import { useDebounce } from './useDebounce'

export interface QuotationFilters {
  debouncedSearch: string
  filterClient: string
}

/**
 * Manages filter, search, and pagination state for the Quotations list page.
 * Automatically resets to page 1 when any filter changes.
 */
export function useQuotationFilters() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClient, setFilterClient] = useState('all')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filterClient])

  const resetFilters = () => {
    setSearchTerm('')
    setFilterClient('all')
    setPage(1)
  }

  return {
    searchTerm,
    setSearchTerm,
    filterClient,
    setFilterClient,
    page,
    setPage,
    resetFilters,
    filters: { debouncedSearch, filterClient } satisfies QuotationFilters,
  }
}
