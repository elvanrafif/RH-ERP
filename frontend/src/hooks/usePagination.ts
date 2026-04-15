import { useState, useEffect } from 'react'

const DEFAULT_PAGE_SIZE = 15

/**
 * Client-side pagination hook.
 * Slices `data` into pages and resets to page 1 whenever `resetDeps` changes.
 */
export function usePagination<T>(
  data: T[],
  resetDeps: unknown[],
  pageSize: number = DEFAULT_PAGE_SIZE
) {
  const [page, setPage] = useState(1)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setPage(1) }, resetDeps)

  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize)

  return { page, setPage, totalItems, totalPages, paginatedData }
}
