import { CreateDocumentDialog } from '@/components/dialogs/CreateDocumentDialog'

type InvoiceType = 'design' | 'sipil' | 'interior'

const INVOICE_TYPE_OPTIONS = [
  { label: 'Design Architecture', value: 'design' },
  { label: 'Sipil / Konstruksi', value: 'sipil' },
  { label: 'Interior Design', value: 'interior' },
]

interface InvoiceCreateDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  clients: any[]
  onSubmit: (payload: { type: InvoiceType; clientId: string }) => void
  isSubmitting: boolean
}

export function InvoiceCreateDialog({
  isOpen,
  onOpenChange,
  clients,
  onSubmit,
  isSubmitting,
}: InvoiceCreateDialogProps) {
  return (
    <CreateDocumentDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Create New Invoice"
      clients={clients}
      onSubmit={({ clientId, type }) => onSubmit({ type: (type as InvoiceType) || 'design', clientId })}
      isSubmitting={isSubmitting}
      typeOptions={INVOICE_TYPE_OPTIONS}
      defaultType="design"
      maxWidth="sm:max-w-[425px]"
    />
  )
}
