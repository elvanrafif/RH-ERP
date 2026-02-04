import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { pb } from '@/lib/pocketbase'
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
import { getTemplateByType } from '../template'

interface InvoiceCreateDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  clients: any[]
}

export function InvoiceCreateDialog({
  isOpen,
  onOpenChange,
  clients,
}: InvoiceCreateDialogProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // STATE
  const [selectedType, setSelectedType] = useState<
    'design' | 'sipil' | 'interior'
  >('design')
  // const [newTitle, setNewTitle] = useState(""); // Title dihapus, tidak perlu input di awal
  const [selectedClient, setSelectedClient] = useState('')

  const createMutation = useMutation({
    mutationFn: async () => {
      const prefix = selectedType.toUpperCase().substring(0, 3)
      const timestamp = Date.now().toString().slice(-6)
      const invoiceNum = `INV-${prefix}-${timestamp}`

      // AMBIL TEMPLATE SESUAI TIPE YANG DIPILIH
      const initialItems = getTemplateByType(selectedType)

      return await pb.collection('invoices').create({
        invoice_number: invoiceNum,
        // title: newTitle, // Title dikosongkan dulu atau set default
        client_id: selectedClient,
        type: selectedType,

        // --- DEFAULT VALUES ---
        date: new Date(),
        status: 'unpaid',
        active_termin: '1',

        // Default Design Data (kalau bukan design, nanti diabaikan di detail page)
        price_per_meter: 200000,
        project_area: 0,

        total_amount: 0, // Awal 0, nanti dihitung di detail
        bank_details: 'BNI - 0717571663\nIsmail Deyrian Anugrah',
        items: initialItems, // <--- PENTING: Items sesuai template tipe
      })
    },
    onSuccess: (data) => {
      toast.success('Invoice dibuat!')
      // Reset Form
      // setNewTitle("");
      setSelectedClient('')
      onOpenChange(false)

      queryClient.invalidateQueries({ queryKey: ['invoices'] })

      // Langsung buka editor
      navigate(`/invoices/${data.id}`)
    },
    onError: () => toast.error('Gagal membuat invoice'),
  })

  const handleSubmit = () => {
    if (!selectedClient || !selectedType) {
      toast.error('Mohon pilih tipe dan klien')
      return
    }
    createMutation.mutate()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Buat Invoice Baru</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 1. Tipe Invoice */}
          <div className="space-y-2">
            <Label>Tipe Invoice</Label>
            <Select
              value={selectedType}
              onValueChange={(val: any) => setSelectedType(val)}
            >
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

          {/* 2. Klien */}
          <div className="space-y-2">
            <Label>Pilih Klien</Label>
            <Select onValueChange={setSelectedClient} value={selectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Cari Klien..." />
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
            className="w-full mt-4"
            onClick={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Buat & Buka Editor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
