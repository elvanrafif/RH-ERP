export function isWithinDateFilter(
  dateStr: string,
  filter: string,
  start: string,
  end: string
): boolean {
  if (!dateStr) return false
  if (filter === 'all') return true

  const d = new Date(dateStr)
  const now = new Date()

  if (filter === 'this_month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }
  if (filter === 'this_year') {
    return d.getFullYear() === now.getFullYear()
  }
  if (filter === 'custom') {
    if (!start || !end) return true
    const startDate = new Date(start)
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(end)
    endDate.setHours(23, 59, 59, 999)
    return d >= startDate && d <= endDate
  }
  return true
}
