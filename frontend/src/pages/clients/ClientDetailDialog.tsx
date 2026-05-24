import type { Client } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Mail, Phone, MapPin, Users } from 'lucide-react'
import { getInitials, formatFullPhone } from '@/lib/helpers'
import { countries } from '@/lib/constants/countries'
import { ClientName } from '@/components/shared/ClientName'

interface ClientDetailDialogProps {
  client: Client | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ClientDetailDialog({
  client,
  open,
  onOpenChange,
}: ClientDetailDialogProps) {
  if (!client) return null

  const picUsers = client.expand?.pic_users ?? []

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
                <ClientName
                  name={client.company_name}
                  salutation={client.salutation}
                />
              </DialogTitle>
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
            <span className="text-slate-700">{formatFullPhone(client.phone, countries)}</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <span className="text-slate-700">{client.address || '—'}</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex flex-wrap gap-1.5">
              {picUsers.length > 0 ? (
                picUsers.map((u) => (
                  <div
                    key={u.id}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium"
                  >
                    <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[8px] shrink-0">
                      {getInitials(u.name || u.email)}
                    </div>
                    <span>{u.name || u.email}</span>
                  </div>
                ))
              ) : (
                <span className="text-slate-400">—</span>
              )}
            </div>
          </div>
          {client.maps_link && (
            <a
              href={client.maps_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" />
              Open in Google Maps
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
