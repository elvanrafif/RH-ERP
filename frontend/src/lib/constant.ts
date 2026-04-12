// Document editor
export const A4_BASE_WIDTH = 800
export const DEFAULT_DESIGN_PRICE_PER_METER = 200_000
export const DEFAULT_QUOTATION_PRICE_PER_METER = 180_000
export const DEFAULT_DP_AMOUNT = 2_500_000

// Resource monitoring
export const WORKLOAD_OVERLOAD_THRESHOLD = 4

// Status constants
export const PROJECT_STATUS = {
  DESIGN: 'design',
  PROGRESS: 'progress',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const

export const PROJECT_TYPE = {
  ARCHITECTURE: 'architecture',
  CIVIL: 'civil',
  INTERIOR: 'interior',
} as const

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  UNPAID: 'unpaid',
  PAID: 'paid',
} as const

export const QUOTATION_STATUS = {
  DRAFT: 'draft',
  PAID: 'paid',
  REJECTED: 'rejected',
} as const

export const DIVISION = {
  MANAGEMENT: 'management',
  ARCHITECTURE: 'arsitektur',
  CIVIL: 'sipil',
  INTERIOR: 'interior',
} as const

export const PAYMENT_ITEM_STATUS = {
  SUCCESS: 'Success',
} as const

export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

// Session timeout — ubah di sini untuk semua behaviour (idle + tab closed)
export const SESSION_TIMEOUT_MS = 1000 * 60 * 60 // 1 jam
export const SESSION_LAST_ACTIVITY_KEY = 'rh_last_activity'

// Deadline notification
export const DEADLINE_WARNING_DAYS = 7
export const DONE_STATUSES = ['finish', 'done', 'cancelled'] as const

export const COMPANY_INFO = {
  NAME: 'RH STUDIO ARSITEK',
  ADDRESS:
    'Ruko Puri Aster,\nJl. Boulevard Grand Depok City\n(+62) 858 1005 5005',
} as const
