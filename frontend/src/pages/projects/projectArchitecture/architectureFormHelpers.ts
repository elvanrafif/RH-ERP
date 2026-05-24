import type { Project } from '@/types'

const DEFAULT_STATUS = 'denah'

export function getArchitectureFormDefaults(
  initialData: Project | null | undefined,
  isSuperAdmin: boolean | null,
  userId: string | undefined
) {
  return {
    client_id: initialData?.client || '',
    assignee: initialData?.assignee || (!isSuperAdmin ? userId : '') || '',
    status: initialData?.status || DEFAULT_STATUS,
    deadline: initialData?.deadline ? initialData.deadline.substring(0, 10) : '',
    luas_tanah: initialData?.luas_tanah || 0,
    luas_bangunan: initialData?.luas_bangunan || 0,
    notes: initialData?.notes || '',
    invoice_id: initialData?.invoice_id || '__none__',
    additional_links: initialData?.meta_data?.additional_links?.length
      ? (initialData.meta_data.additional_links as Array<string | { label?: string; url: string }>).map(
          (v) => (typeof v === 'string' ? { label: '', url: v } : { label: v.label ?? '', url: v.url ?? '' })
        )
      : [{ label: '', url: '' }],
  }
}

type ArchitectureFormValues = ReturnType<typeof getArchitectureFormDefaults>

export function buildArchitecturePayload(data: ArchitectureFormValues) {
  return {
    client: data.client_id,
    assignee: data.assignee || null,
    status: data.status,
    type: 'architecture' as const,
    deadline: data.deadline || null,
    luas_tanah: data.luas_tanah || null,
    luas_bangunan: data.luas_bangunan || null,
    notes: data.notes || null,
    invoice_id: data.invoice_id === '__none__' ? null : data.invoice_id || null,
    meta_data: {
      additional_links:
        data.additional_links
          ?.filter((l) => l.url.trim())
          .map((l) => ({ label: l.label?.trim() ?? '', url: l.url.trim() })) || [],
    },
  }
}
