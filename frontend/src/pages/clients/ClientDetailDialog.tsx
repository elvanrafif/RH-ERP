import type { Client } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Mail, Phone, MapPin } from 'lucide-react'

interface ClientDetailDialogProps {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export function ClientDetailDialog({
  client,
  open,
  onOpenChange,
}: ClientDetailDialogProps) {
  if (!client) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
              {getInitials(client.company_name)}
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {client.company_name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {client.contact_person || '—'}
              </p>
            </div>
          </div>
        </DialogHeader>
        <Separator />
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-slate-700">{client.email || '—'}</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-slate-700">{client.phone || '—'}</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-slate-700">{client.address || '—'}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
