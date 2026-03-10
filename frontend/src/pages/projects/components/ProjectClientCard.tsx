import type { Client } from '@/types'
import { MapPin, Phone, Mail } from 'lucide-react'

interface ProjectClientCardProps {
  client: Client | undefined
}

export function ProjectClientCard({ client }: ProjectClientCardProps) {
  return (
    <div className="space-y-2.5">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
        Contact Info
      </p>
      <div className="space-y-1.5">
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span className="leading-snug">
            {(client as any)?.address || 'Address not available'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <span>{client?.phone || '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span>{client?.email || '—'}</span>
        </div>
      </div>
    </div>
  )
}
