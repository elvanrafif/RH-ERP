import type { Project } from '@/types'
import { normalizeAdditionalLinks, buildAdditionalLinksPayload } from '../formHelpers'

const STATUS_OPTIONS_DEFAULT = 'building'

export function getCivilFormDefaults(initialData?: Project | null, currentUserId?: string) {
  return {
    client_id: initialData?.client || '',
    assignee: initialData ? (initialData.assignee || '') : (currentUserId || ''),
    status: initialData?.status || STATUS_OPTIONS_DEFAULT,
    start_date: initialData?.start_date ? initialData.start_date.substring(0, 10) : '',
    end_date: initialData?.end_date ? initialData.end_date.substring(0, 10) : '',
    luas_tanah: initialData?.luas_tanah || 0,
    luas_bangunan: initialData?.luas_bangunan || 0,
    vendor: initialData?.vendor || '',
    source_architecture: initialData?.source_architecture || '__none__',
    notes: initialData?.notes || '',
    invoice_id: initialData?.invoice_id || '__none__',
    additional_links: normalizeAdditionalLinks(initialData?.meta_data?.additional_links),
  }
}

type CivilFormValues = ReturnType<typeof getCivilFormDefaults>

export function buildCivilPayload(data: CivilFormValues) {
  return {
    client: data.client_id,
    assignee: data.assignee && data.assignee !== 'unassigned' ? data.assignee : null,
    status: data.status,
    type: 'civil' as const,
    start_date: data.start_date || null,
    end_date: data.end_date || null,
    luas_tanah: data.luas_tanah || null,
    luas_bangunan: data.luas_bangunan || null,
    vendor: data.vendor || null,
    source_architecture:
      data.source_architecture === '__none__' ? null : data.source_architecture || null,
    notes: data.notes || null,
    invoice_id: data.invoice_id === '__none__' ? null : data.invoice_id || null,
    meta_data: {
      additional_links: buildAdditionalLinksPayload(data.additional_links),
    },
  }
}
