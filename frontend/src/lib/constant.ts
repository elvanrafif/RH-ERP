export const SipilPic = ['Pak Sur', 'Sarman', 'Sugeng', 'Pak Ipan', 'Mas Dayat']

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
