const DIVISION_LABELS: Record<string, string> = {
  sipil: 'Civil',
  arsitektur: 'Architecture',
  interior: 'Interior',
  management: 'Management',
  socmed: 'Social Media',
}

const ARCHITECTURE_STATUS_LABELS: Record<string, string> = {
  denah: 'Floor Plan Stage',
  fasad: 'Facade Stage',
  detail_drawing: 'Detail Drawing',
  finish: 'Finish',
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

export const MaskingTextByArchitectureStatus = (status?: string) =>
  (status && ARCHITECTURE_STATUS_LABELS[status]) ||
  status?.replace(/_/g, ' ') ||
  '—'
