import type { Project } from '@/types'

const DEFAULT_STATUS = 'draft_skematik'

export function getInteriorFormDefaults(
  initialData: Project | null | undefined,
  isSuperAdmin: boolean | null,
  userId: string | undefined
) {
  return {
    client_id: initialData?.client || '',
    assignee: initialData?.assignee || (!isSuperAdmin ? userId : '') || '',
    status: initialData?.status || DEFAULT_STATUS,
    deadline: initialData?.deadline ? initialData.deadline.substring(0, 10) : '',
    vendor: initialData?.vendor || '',
    area_scope: initialData?.meta_data?.area_scope || '',
    notes: initialData?.notes || '',
    invoice_id: initialData?.invoice_id || '__none__',
    additional_links: initialData?.meta_data?.additional_links?.length
      ? (initialData.meta_data.additional_links as Array<string | { label?: string; url: string }>).map(
          (v) => (typeof v === 'string' ? { label: '', url: v } : { label: v.label ?? '', url: v.url ?? '' })
        )
      : [{ label: '', url: '' }],
  }
}

type InteriorFormValues = ReturnType<typeof getInteriorFormDefaults>

export function buildInteriorPayload(data: InteriorFormValues) {
  return {
    client: data.client_id,
    assignee: data.assignee || null,
    status: data.status,
    type: 'interior' as const,
    deadline: data.deadline || null,
    vendor: data.vendor || null,
    notes: data.notes || null,
    invoice_id: data.invoice_id === '__none__' ? null : data.invoice_id || null,
    meta_data: {
      area_scope: data.area_scope || '',
      additional_links:
        data.additional_links
          ?.filter((l) => l.url.trim())
          .map((l) => ({ label: l.label?.trim() ?? '', url: l.url.trim() })) || [],
    },
  }
}
