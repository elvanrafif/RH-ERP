import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormDialog } from '@/components/shared/FormDialog'

interface TypeOption {
  label: string
  value: string
}

interface CreateDocumentDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  clients: { id: string; company_name: string }[]
  onSubmit: (payload: { clientId: string; type?: string }) => void
  isSubmitting: boolean
  typeOptions?: TypeOption[]
  defaultType?: string
  maxWidth?: string
}

export function CreateDocumentDialog({
  isOpen,
  onOpenChange,
  title,
  clients,
  onSubmit,
  isSubmitting,
  typeOptions,
  defaultType,
  maxWidth,
}: CreateDocumentDialogProps) {
  const [selectedType, setSelectedType] = useState(defaultType ?? typeOptions?.[0]?.value ?? '')
  const [selectedClient, setSelectedClient] = useState('')

  const handleSubmit = () => {
    if (!selectedClient) {
      toast.error('Please select a client')
      return
    }
    if (typeOptions && !selectedType) {
      toast.error('Please select a document type')
      return
    }
    onSubmit({ clientId: selectedClient, type: typeOptions ? selectedType : undefined })
  }

  return (
    <FormDialog open={isOpen} onOpenChange={onOpenChange} title={title} maxWidth={maxWidth}>
      <div className="space-y-4 py-4">
        {typeOptions && (
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label>Client</Label>
          <Select onValueChange={setSelectedClient} value={selectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Select a client..." />
            </SelectTrigger>
            <SelectContent>
              {clients?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full mt-4" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create & Open Editor
        </Button>
      </div>
    </FormDialog>
  )
}
