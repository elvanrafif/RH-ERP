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

type InvoiceType = 'design' | 'sipil' | 'interior'

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
  const [selectedType, setSelectedType] = useState<InvoiceType>('design')
  const [selectedClient, setSelectedClient] = useState('')

  const handleSubmit = () => {
    if (!selectedClient || !selectedType) {
      toast.error('Mohon pilih tipe dan klien')
      return
    }
    onSubmit({ type: selectedType, clientId: selectedClient })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Invoice Type</Label>
            <Select value={selectedType} onValueChange={(val: InvoiceType) => setSelectedType(val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="design">Design Architecture</SelectItem>
                <SelectItem value="sipil">Sipil / Konstruksi</SelectItem>
                <SelectItem value="interior">Interior Design</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Client</Label>
            <Select onValueChange={setSelectedClient} value={selectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Select Client..." />
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

          <Button className="w-full mt-4" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create & Open Editor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
