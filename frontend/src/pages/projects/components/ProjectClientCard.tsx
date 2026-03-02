import type { Client } from '@/types'
import { Building2, MapPin, Phone, Mail } from 'lucide-react'

interface ProjectClientCardProps {
  client: Client | undefined
}

export function ProjectClientCard({ client }: ProjectClientCardProps) {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center">
        <Building2 className="h-3 w-3 mr-1.5" /> Client Information
      </h4>

      <div className="space-y-3 flex-1">
        <div>
          <h3 className="text-lg font-bold text-slate-900 leading-tight">
            {client?.company_name || 'No Company Name'}
          </h3>
        </div>
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-start text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5 mr-2 mt-0.5 text-slate-400 shrink-0" />
            <span className="leading-tight">
              {(client as any)?.address || 'Address not available.'}
            </span>
          </div>
          <div className="flex items-center text-xs text-slate-600">
            <Phone className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
            <span>{client?.phone || '-'}</span>
          </div>
          <div className="flex items-center text-xs text-slate-600">
            <Mail className="h-3.5 w-3.5 mr-2 text-slate-400 shrink-0" />
            <span>{client?.email || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
