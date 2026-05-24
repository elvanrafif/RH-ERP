import type { Client } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Mail, Phone, MapPin, Users } from 'lucide-react'
import { getInitials, formatFullPhone, getAvatarUrl } from '@/lib/helpers'
import { countries } from '@/lib/constants/countries'
import { ClientName } from '@/components/shared/ClientName'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

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
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {getInitials(client.company_name)}
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <DialogTitle className="truncate">
              <ClientName name={client.company_name} />
            </DialogTitle>
            <span className="text-xs text-muted-foreground truncate">
              CP: {client.contact_person}
            </span>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-4 py-2">
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
                    <Avatar className="h-4 w-4 shrink-0">
                      <AvatarImage src={getAvatarUrl(u) || ''} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-[8px]">
                        {getInitials(u.name || u.email)}
                      </AvatarFallback>
                    </Avatar>
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
