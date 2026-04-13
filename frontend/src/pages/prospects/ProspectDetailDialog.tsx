import type { Prospect } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Instagram } from 'lucide-react'
import { formatDateTime } from '@/lib/helpers'

interface ProspectDetailDialogProps {
  prospect: Prospect | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 break-words">{value || '—'}</p>
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
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Instagram className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-slate-900">
                  {prospect.client_name}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  @{prospect.instagram}
                </p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs capitalize shrink-0 mt-4">
              {prospect.status}
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        {/* Contact */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Field label="Phone" value={prospect.phone} />
          <Field label="Address" value={prospect.address} />
        </div>

        <Separator />

        {/* Property */}
        <div className="grid grid-cols-3 gap-x-6 gap-y-3">
          <Field
            label="Land Size"
            value={prospect.land_size ? `${prospect.land_size} m²` : undefined}
          />
          <Field
            label="Floor"
            value={prospect.floor ? `${prospect.floor} Lantai` : undefined}
          />
          <Field label="Renovation Type" value={prospect.renovation_type} />
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1">Needs</p>
          {prospect.needs?.length ? (
            <div className="flex gap-1 flex-wrap">
              {prospect.needs.map((n) => (
                <Badge key={n} variant="outline" className="text-xs">
                  {n}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-800">—</p>
          )}
        </div>

        <Separator />

        {/* Notes & Schedule */}
        <Field label="Notes" value={prospect.notes} />

        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Field
            label="Meeting Schedule"
            value={formatDateTime(prospect.meeting_schedule)}
          />
          <Field
            label="Survey Schedule"
            value={formatDateTime(prospect.survey_schedule)}
          />
          <Field label="Confirmation" value={prospect.confirmation} />
          <Field label="Quotation" value={prospect.quotation} />
        </div>

        <Field label="Result" value={prospect.result} />
      </DialogContent>
    </Dialog>
  )
}
