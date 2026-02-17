import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Loader2 } from 'lucide-react'

interface QuotationCreateDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  clients: any[]
}

export function QuotationCreateDialog({
  isOpen,
  onOpenChange,
  clients,
}: QuotationCreateDialogProps) {
  const navigate = useNavigate()

  const [selectedClient, setSelectedClient] = useState('')

  const createMutation = useMutation({
    mutationFn: async () => {
      return await pb.collection('quotations').create({
        client_id: selectedClient,
        date: new Date(),
        status: 'draft',
        items: [],
        total_amount: 0,
      })
    },
    onSuccess: (data) => {
      toast.success('Quotation created!')
      onOpenChange(false)
      setSelectedClient('')
      navigate(`/quotations/${data.id}`)
    },
    onError: () => toast.error('Failed to create quotation'),
  })

  const handleCreateSubmit = () => {
    if (!selectedClient) {
      toast.error('Please enter a title and select a client')
      return
    }
    createMutation.mutate()
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
          <Button
            className="w-full mt-2"
            onClick={handleCreateSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create & Open Editor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
