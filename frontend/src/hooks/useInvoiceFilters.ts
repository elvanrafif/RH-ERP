import { useState, useEffect } from 'react'
import { useDebounce } from './useDebounce'

export interface InvoiceFilters {
  debouncedSearch: string
  filterClient: string
  activeTab: string
}

/**
 * Manages all filter, search, and pagination state for the Invoices list page.
 * Automatically resets to page 1 when any filter changes.
 */
export function useInvoiceFilters() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClient, setFilterClient] = useState('all')
  const [activeTab, setActiveTab] = useState('all')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, filterClient, activeTab])

  const resetFilters = () => {
    setSearchTerm('')
    setFilterClient('all')
    setActiveTab('all')
    setPage(1)
  }

  return {
    searchTerm,
    setSearchTerm,
    filterClient,
    setFilterClient,
    activeTab,
    setActiveTab,
    page,
    setPage,
    resetFilters,
    filters: { debouncedSearch, filterClient, activeTab } satisfies InvoiceFilters,
  }
}
