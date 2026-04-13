import type { ElementType } from 'react'
import type { Prospect } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Instagram,
  Phone,
  MapPin,
  CalendarClock,
  FileText,
  CheckSquare,
  Layers,
  Wrench,
  ClipboardList,
  CalendarCheck,
} from 'lucide-react'
import { formatDateTime } from '@/lib/helpers'

interface ProspectDetailDialogProps {
  prospect: Prospect | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-slate-800 break-words">{value || '—'}</p>
      </div>
    </div>
  )
}

export function ProspectDetailDialog({
  prospect,
  open,
  onOpenChange,
}: ProspectDetailDialogProps) {
  if (!prospect) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
              <Instagram className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {prospect.client_name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                @{prospect.instagram}
              </p>
              <Badge className="mt-1 bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs capitalize">
                {prospect.status}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-3">
          <DetailRow icon={Phone} label="Phone" value={prospect.phone} />
          <DetailRow icon={MapPin} label="Address" value={prospect.address} />
          <DetailRow
            icon={Layers}
            label="Land Size"
            value={prospect.land_size ? `${prospect.land_size} m²` : undefined}
          />
          <DetailRow
            icon={CheckSquare}
            label="Needs"
            value={
              prospect.needs?.length ? (
                <div className="flex gap-1 flex-wrap">
                  {prospect.needs.map((n) => (
                    <Badge key={n} variant="outline" className="text-xs">
                      {n}
                    </Badge>
                  ))}
                </div>
              ) : undefined
            }
          />
          <DetailRow
            icon={Wrench}
            label="Floor"
            value={prospect.floor ? `${prospect.floor} Lantai` : undefined}
          />
          <DetailRow
            icon={Wrench}
            label="Renovation Type"
            value={prospect.renovation_type}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <DetailRow
            icon={FileText}
            label="Notes"
            value={
              prospect.notes ? (
                <span className="whitespace-pre-wrap">{prospect.notes}</span>
              ) : undefined
            }
          />
          <DetailRow
            icon={CalendarClock}
            label="Meeting Schedule (WIB)"
            value={formatDateTime(prospect.meeting_schedule)}
          />
          <DetailRow
            icon={FileText}
            label="Confirmation"
            value={prospect.confirmation}
          />
          <DetailRow
            icon={ClipboardList}
            label="Quotation"
            value={prospect.quotation}
          />
          <DetailRow
            icon={CalendarCheck}
            label="Survey Schedule"
            value={formatDateTime(prospect.survey_schedule)}
          />
          <DetailRow
            icon={FileText}
            label="Result"
            value={prospect.result}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
