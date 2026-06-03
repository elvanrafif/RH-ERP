import { useState, useEffect } from 'react'
import { useDebounce } from './useDebounce'

export interface InvoiceFilters {
  debouncedSearch: string
  activeTab: string
  filterTermin: string
  sortBy: string
}

/**
 * Manages all filter, search, and pagination state for the Invoices list page.
 * Automatically resets to page 1 when any filter changes.
 */
export function useInvoiceFilters() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [filterTermin, setFilterTermin] = useState('all')
  const [sortBy, setSortBy] = useState('created_desc')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, activeTab, filterTermin, sortBy])

  const resetFilters = () => {
    setSearchTerm('')
    setActiveTab('all')
    setFilterTermin('all')
    setSortBy('created_desc')
    setPage(1)
  }

  return {
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    filterTermin,
    setFilterTermin,
    sortBy,
    setSortBy,
    page,
    setPage,
    resetFilters,
    filters: { debouncedSearch, activeTab, filterTermin, sortBy } satisfies InvoiceFilters,
  }
}
