import type { Survey } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatDateTime } from '@/lib/helpers'
import { SURVEY_STATUS } from '@/lib/constant'
import { Building2, User, Calendar, FileText, Pencil, Phone, Mail, MapPin, ExternalLink } from 'lucide-react'

interface SurveyDetailDialogProps {
  survey: Survey | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (survey: Survey) => void
}

function Field({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode
  label: string
  value?: string | null
  href?: string
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1 truncate"
          >
            Open Maps <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        ) : (
          <p className="text-sm font-medium text-slate-800 truncate">{value ?? '—'}</p>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: 'pending' | 'done' }) {
  if (status === SURVEY_STATUS.DONE) {
    return (
      <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700">
        Done
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-700">
      Pending
    </span>
  )
}

export function SurveyDetailDialog({
  survey,
  open,
  onOpenChange,
  onEdit,
}: SurveyDetailDialogProps) {
  if (!survey) return null

  const client = survey.expand?.client
  const surveyor = survey.expand?.surveyor

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900">
                {client?.company_name ?? 'Survey Detail'}
              </DialogTitle>
              <div className="mt-1.5">
                <StatusBadge status={survey.status} />
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Client
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Field
                icon={<User className="h-3.5 w-3.5" />}
                label="Client Name"
                value={client?.contact_person}
              />
              <Field
                icon={<Phone className="h-3.5 w-3.5" />}
                label="Phone"
                value={client?.phone}
              />
              <Field
                icon={<Mail className="h-3.5 w-3.5" />}
                label="Email"
                value={client?.email}
              />
              <Field
                icon={<Building2 className="h-3.5 w-3.5" />}
                label="Address"
                value={client?.address}
              />
              {client?.maps_link && (
                <Field
                  icon={<MapPin className="h-3.5 w-3.5" />}
                  label="Maps"
                  href={client.maps_link}
                />
              )}
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Survey
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Field
                icon={<User className="h-3.5 w-3.5" />}
                label="Surveyor"
                value={surveyor?.name}
              />
              <Field
                icon={<Calendar className="h-3.5 w-3.5" />}
                label="Schedule"
                value={formatDateTime(survey.schedule)}
              />
              {survey.notes && (
                <div className="col-span-2">
                  <Field
                    icon={<FileText className="h-3.5 w-3.5" />}
                    label="Notes"
                    value={survey.notes}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onOpenChange(false)
              onEdit(survey)
            }}
          >
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
