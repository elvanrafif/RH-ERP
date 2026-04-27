import type { Client } from '@/types'
import { MapPin, Phone, Mail } from 'lucide-react'

interface ProjectClientCardProps {
  client: Client | undefined
}

export function ProjectClientCard({ client }: ProjectClientCardProps) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-semibold text-foreground">Contact Info</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5 shrink-0" />
          <span>{client?.phone || '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          <span>{client?.email || '—'}</span>
        </div>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span className="leading-snug">
            {client?.address || 'Address not available'}
          </span>
        </div>
        {client?.maps_link && (
          <a
            href={client.maps_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium hover:bg-emerald-100 transition-colors"
          >
            <MapPin className="h-3 w-3" />
            Open in Google Maps
          </a>
        )}
      </div>
    </div>
  )
}
