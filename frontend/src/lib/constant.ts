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
  SOCMED: 'socmed',
} as const

/** Maps PROJECT_TYPE keys → DIVISION values for user filtering */
export const PROJECT_TYPE_TO_DIVISION: Record<string, string> = {
  architecture: DIVISION.ARCHITECTURE,
  civil: DIVISION.CIVIL,
  interior: DIVISION.INTERIOR,
}

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

// Prospect
export const PROSPECT_STATUS = {
  WAITING: 'waiting for online schedule',
} as const

export const FLOOR_OPTIONS = [
  '1',
  '1.5',
  '2',
  '2.5',
  '3',
  '3.5',
  '4',
  '4.5',
  '5',
] as const

export const NEEDS_OPTIONS = ['Design', 'Build'] as const

export const RENOVATION_TYPE_OPTIONS = [
  'new build',
  'total renovation',
] as const

export const QUOTATION_OPTIONS = ['design', 'civil'] as const
