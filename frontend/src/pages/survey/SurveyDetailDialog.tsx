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
import { Building2, User, Calendar, FileText, Pencil } from 'lucide-react'

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
}: {
  icon: React.ReactNode
  label: string
  value?: string | null
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value ?? '—'}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
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
      <DialogContent className="max-w-sm">
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
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Client
            </p>
            <Field
              icon={<Building2 className="h-4 w-4" />}
              label="Company"
              value={client?.company_name}
            />
            {client?.contact_person && (
              <Field
                icon={<User className="h-4 w-4" />}
                label="Contact Person"
                value={client.contact_person}
              />
            )}
            {client?.phone && (
              <Field
                icon={<User className="h-4 w-4" />}
                label="Phone"
                value={client.phone}
              />
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Survey
            </p>
            <Field
              icon={<User className="h-4 w-4" />}
              label="Surveyor"
              value={surveyor?.name}
            />
            <Field
              icon={<Calendar className="h-4 w-4" />}
              label="Schedule"
              value={formatDateTime(survey.schedule)}
            />
            {survey.notes && (
              <Field
                icon={<FileText className="h-4 w-4" />}
                label="Notes"
                value={survey.notes}
              />
            )}
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
