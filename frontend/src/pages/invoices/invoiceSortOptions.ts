export const INVOICE_SORT_OPTIONS = [
  { value: 'created_desc', label: 'Newest First', sortParam: '-created' },
  { value: 'created_asc', label: 'Oldest First', sortParam: 'created' },
] as const
