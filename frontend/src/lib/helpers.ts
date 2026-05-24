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

export const formatDateLongEn = (dateStr?: string | Date) => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
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

export const formatClientName = (client: {
  company_name: string
  salutation?: string
}) =>
  client.salutation
    ? `${client.salutation} ${client.company_name}`
    : client.company_name

export const getSalutationLabel = (salutation?: string): string => {
  const s = salutation?.toLowerCase().replace(/\./g, '')
  if (s === 'mr') return 'BAPAK'
  if (s === 'mrs' || s === 'ms' || s === 'miss') return 'IBU'
  return ''
}

export const buildInvoiceFileName = (
  clientName: string,
  type: string,
  activeTermin: string | number,
  items: { status?: string; paymentDate?: string }[],
  salutation?: string
): string => {
  const activeItem = items[Number(activeTermin) - 1]
  const isUpdate = !!(
    activeItem?.status === 'Success' && activeItem?.paymentDate
  )
  const prefix = isUpdate ? 'INVOICE_UPDATE' : 'INVOICE'
  const typePart = type.toUpperCase()
  const terminPart = `TERMIN${activeTermin}`
  const salutationLabel = getSalutationLabel(salutation)
  const name = clientName.toUpperCase().replace(/\s+/g, '_')
  return salutationLabel
    ? `${prefix}_${typePart}_${terminPart}_${salutationLabel}_${name}`
    : `${prefix}_${typePart}_${terminPart}_${name}`
}

export const buildQuotationFileName = (
  clientName: string,
  salutation?: string,
  projectArea?: number
): string => {
  const prefix = projectArea ? 'QUOTATION_UPDATE_DESIGN' : 'QUOTATION_DESIGN'
  const salutationLabel = getSalutationLabel(salutation)
  const name = clientName.toUpperCase().replace(/\s+/g, '_')
  return salutationLabel
    ? `${prefix}_${salutationLabel}_${name}`
    : `${prefix}_${name}`
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

const pad = (n: number) => String(n).padStart(2, '0')

export const toLocalDateTimeInput = (isoString?: string | null): string => {
  if (!isoString) return ''
  const d = new Date(isoString)
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  )
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

export function escapePbFilter(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export function formatPhoneNumber(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('0')) {
    digits = digits.substring(1)
  }
  const len = digits.length
  if (len <= 3) return digits
  if (len <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (len === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  if (len === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  if (len === 12) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`
  }
  if (len >= 13) {
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 13)}`
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

export function parseStoredPhone(
  phone: string,
  countryList: Array<{ code: string; dial_code: string }> = []
): { prefix: string; localNumber: string } {
  if (!phone) return { prefix: '+62', localNumber: '' }
  const trimmed = phone.trim()

  // Case 1: Starts with '+' (e.g. +62 815-9150-400 or +62 62815...)
  if (trimmed.startsWith('+')) {
    const matched = countryList.length > 0 
      ? [...countryList].sort((a, b) => b.dial_code.length - a.dial_code.length).find((c) => trimmed.startsWith(c.dial_code))
      : trimmed.startsWith('+62') ? { dial_code: '+62' } : null;
      
    if (matched) {
      let rest = trimmed.substring(matched.dial_code.length).trim()
      const cleanPrefix = matched.dial_code.substring(1)
      const digitsOnlyRest = rest.replace(/\D/g, '')
      if (digitsOnlyRest.startsWith(cleanPrefix)) {
        rest = digitsOnlyRest.substring(cleanPrefix.length)
      }
      return {
        prefix: matched.dial_code,
        localNumber: formatPhoneNumber(rest),
      }
    }
  }

  // Case 2: Starts with country code but without '+' (e.g. 628159150400)
  const withPlus = '+' + trimmed.replace(/\s+/g, '')
  const matchedNoPlus = countryList.length > 0
    ? [...countryList].sort((a, b) => b.dial_code.length - a.dial_code.length).find((c) => withPlus.startsWith(c.dial_code))
    : withPlus.startsWith('+62') ? { dial_code: '+62' } : null;

  if (matchedNoPlus) {
    const cleanPrefix = matchedNoPlus.dial_code.substring(1)
    const digitsOnlyInput = trimmed.replace(/\D/g, '')
    if (digitsOnlyInput.startsWith(cleanPrefix)) {
      const rest = digitsOnlyInput.substring(cleanPrefix.length)
      return {
        prefix: matchedNoPlus.dial_code,
        localNumber: formatPhoneNumber(rest),
      }
    }
  }

  // Case 3: Starts with '0'
  if (trimmed.startsWith('0')) {
    return {
      prefix: '+62',
      localNumber: formatPhoneNumber(trimmed.substring(1)),
    }
  }

  // Case 4: Default
  return {
    prefix: '+62',
    localNumber: formatPhoneNumber(trimmed),
  }
}

export function formatFullPhone(
  phone: string,
  countryList: Array<{ code: string; dial_code: string }> = []
): string {
  if (!phone) return '—'
  const { prefix, localNumber } = parseStoredPhone(phone, countryList)
  return localNumber ? `${prefix} ${localNumber}` : prefix
}
