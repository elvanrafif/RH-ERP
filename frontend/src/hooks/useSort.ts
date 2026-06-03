import { useState, useMemo } from 'react'

export interface SortOption<T> {
  value: string
  label: string
  compareFn: (a: T, b: T) => number
}

export function useSort<T>(data: T[], options: SortOption<T>[]) {
  const [sortValue, setSortValue] = useState<string | null>(null)

  const sortedData = useMemo(() => {
    if (!sortValue) return data
    const option = options.find((o) => o.value === sortValue)
    return option ? [...data].sort(option.compareFn) : data
  }, [data, sortValue])

  return { sortedData, sortValue, setSortValue }
}
