import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  const [selectedClient, setSelectedClient] = useState('')

  const handleSubmit = () => {
    if (!selectedClient) {
      toast.error('Please select a client')
      return
    }
    onSubmit({ clientId: selectedClient })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Quotation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Client</Label>
            <Select onValueChange={setSelectedClient} value={selectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client..." />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client: any) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full mt-2" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create & Open Editor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
