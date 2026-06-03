import { useState, useEffect } from 'react'
import { useDebounce } from './useDebounce'

export interface InvoiceFilters {
  debouncedSearch: string
  activeTab: string
  filterTermin: string
  filterPaymentMonth: string | null
  sortBy: string
}

export function useInvoiceFilters() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [filterTermin, setFilterTermin] = useState('all')
  const [filterPaymentMonth, setFilterPaymentMonth] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('created_desc')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounce(searchTerm, 500)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, activeTab, filterTermin, filterPaymentMonth, sortBy])

  const resetFilters = () => {
    setSearchTerm('')
    setActiveTab('all')
    setFilterTermin('all')
    setFilterPaymentMonth(null)
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
    filterPaymentMonth,
    setFilterPaymentMonth,
    sortBy,
    setSortBy,
    page,
    setPage,
    resetFilters,
    filters: {
      debouncedSearch,
      activeTab,
      filterTermin,
      filterPaymentMonth,
      sortBy,
    } satisfies InvoiceFilters,
  }
}
