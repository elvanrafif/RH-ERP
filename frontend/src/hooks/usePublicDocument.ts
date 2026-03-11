import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

const ALLOWED_DOC_TYPES = ['invoices', 'quotations'] as const
type AllowedDocType = (typeof ALLOWED_DOC_TYPES)[number]

export function usePublicDocument(
  docType: string | undefined,
  id: string | undefined
) {
  const isValidDocType = ALLOWED_DOC_TYPES.includes(docType as AllowedDocType)

  return useQuery({
    queryKey: ['public-doc', docType, id],
    queryFn: async () => {
      if (!isValidDocType) throw new Error('Invalid document type')
      return await pb
        .collection(docType as AllowedDocType)
        .getOne(id as string, { expand: 'client_id' })
    },
    retry: false,
    enabled: !!docType && !!id && isValidDocType,
  })
}
