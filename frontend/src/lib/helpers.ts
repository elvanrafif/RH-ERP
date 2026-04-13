import { pb } from './pocketbase'

export const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val)
}

export const formatDate = (dateStr?: string | Date) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  })
}

export const formatDateShort = (dateStr?: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  })
}

export const formatDateLong = (dateStr?: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export interface TimeUntilResult {
  label: string
  isOverdue: boolean
}

export const formatTimeUntil = (dateStr?: string): TimeUntilResult | null => {
  if (!dateStr) return null
  const target = new Date(dateStr)
  if (isNaN(target.getTime())) return null

  const diffMs = target.getTime() - Date.now()
  if (diffMs < 0) return { label: 'Overdue', isOverdue: true }

  const totalMinutes = Math.floor(diffMs / (1000 * 60))
  const days = Math.floor(totalMinutes / (60 * 24))
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60)

  if (days > 0) return { label: `${days}d ${hours}h left`, isOverdue: false }
  if (hours > 0) return { label: `${hours}h left`, isOverdue: false }
  return { label: '< 1h left', isOverdue: false }
}

export const getInitials = (name?: string) =>
  name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : '??'
export const getAvatarUrl = (user?: any) =>
  user?.avatar ? pb.files.getUrl(user, user.avatar) : null

export function calculateDuration(startDateStr?: string, endDateStr?: string) {
  if (!startDateStr || !endDateStr) return '-'
  const start = new Date(startDateStr)
  const end = new Date(endDateStr)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return '-'

  let months = (end.getFullYear() - start.getFullYear()) * 12
  months -= start.getMonth()
  months += end.getMonth()

  let days = end.getDate() - start.getDate()

  if (days < 0) {
    months -= 1
    // Get the number of days in the previous month
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
    days += prevMonth.getDate()
  }

  const monthText =
    months > 0 ? `${months} ${months > 1 ? 'Months' : 'Month'}` : ''
  const dayText = days > 0 ? `${days} ${days > 1 ? 'Days' : 'Day'}` : ''

  if (months > 0 && days > 0) return `${monthText} ${dayText}`
  if (months > 0) return monthText
  if (days > 0) return dayText
  return '0 Days'
}

export function getRemainingTime(endDateStr?: string) {
  if (!endDateStr) return '-'
  const end = new Date(endDateStr)
  const today = new Date()

  // Reset jam agar kalkulasi fokus pada tanggal
  end.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const diffTime = end.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  // Jika sudah lewat deadline
  if (diffDays < 0) return `${Math.abs(diffDays)} Days Overdue`
  if (diffDays === 0) return 'Ends Today'

  // Hitung bulan dan hari tersisa
  let months = (end.getFullYear() - today.getFullYear()) * 12
  months -= today.getMonth()
  months += end.getMonth()

  let days = end.getDate() - today.getDate()

  if (days < 0) {
    months -= 1
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0)
    days += prevMonth.getDate()
  }

  const monthText =
    months > 0 ? `${months} ${months > 1 ? 'Months' : 'Month'}` : ''
  const dayText = days > 0 ? `${days} ${days > 1 ? 'Days' : 'Day'}` : ''

  if (months > 0 && days > 0) return `${monthText} ${dayText} Left`
  if (months > 0) return `${monthText} Left`
  if (days > 0) return `${dayText} Left`

  return '-'
}

export const formatRupiahDisplay = (value: number | string) => {
  if (!value) return ''
  const numberString = value.toString().replace(/[^,\d]/g, '')
  const split = numberString.split(',')
  let sisa = split[0].length % 3
  let rupiah = split[0].substr(0, sisa)
  const ribuan = split[0].substr(sisa).match(/\d{3}/gi)
  if (ribuan) {
    const separator = sisa ? '.' : ''
    rupiah += separator + ribuan.join('.')
  }
  return split[1] !== undefined ? rupiah + ',' + split[1] : rupiah
}
