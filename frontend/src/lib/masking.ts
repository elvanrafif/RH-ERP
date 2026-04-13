const DIVISION_LABELS: Record<string, string> = {
  sipil: 'Civil',
  arsitektur: 'Architecture',
  interior: 'Interior',
  management: 'Management',
  socmed: 'Social Media',
}

const INVOICE_TYPE_LABELS: Record<string, string> = {
  design: 'Design',
  sipil: 'Civil',
  interior: 'Interior',
  management: 'Management',
}

export const MaskingTextByDivision = (division?: string) =>
  (division && DIVISION_LABELS[division]) || 'General'

export const MaskingTextByInvoiceType = (type?: string) =>
  (type && INVOICE_TYPE_LABELS[type]) || 'General'
