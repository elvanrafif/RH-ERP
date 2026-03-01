import { CreateDocumentDialog } from '@/components/dialogs/CreateDocumentDialog'
import type { CreateQuotationPayload } from '@/hooks/useQuotations'

interface QuotationCreateDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  clients: any[]
  onSubmit: (payload: CreateQuotationPayload) => void
  isSubmitting: boolean
}

export function QuotationCreateDialog({
  isOpen,
  onOpenChange,
  clients,
  onSubmit,
  isSubmitting,
}: QuotationCreateDialogProps) {
  return (
    <CreateDocumentDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Create New Quotation"
      clients={clients}
      onSubmit={({ clientId }) => onSubmit({ clientId })}
      isSubmitting={isSubmitting}
    />
  )
}
