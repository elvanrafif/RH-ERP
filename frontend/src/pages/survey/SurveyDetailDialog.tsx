import type { Survey } from '@/types'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatDateTime, getRemainingTime } from '@/lib/helpers'
import { SURVEY_STATUS } from '@/lib/constant'
import { Pencil, ExternalLink } from 'lucide-react'

interface SurveyDetailDialogProps {
  survey: Survey | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (survey: Survey) => void
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
      {children}
    </div>
  )
}

function TextValue({ value }: { value?: string | null }) {
  return (
    <p className="text-sm font-medium text-slate-800 truncate">
      {value ?? '—'}
    </p>
  )
}

function StatusBadge({ status }: { status: 'pending' | 'done' }) {
  if (status === SURVEY_STATUS.DONE) {
    return (
      <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
        Done
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
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
  const remaining = getRemainingTime(survey.schedule)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle className="sr-only">
          {client?.company_name ?? 'Survey Detail'}
        </DialogTitle>

        <div className="space-y-4 pt-2">
          {/* Client */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Client
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-x-4">
                <Field label="Client Name">
                  <TextValue value={client?.company_name} />
                </Field>
                <Field label="Status">
                  <StatusBadge status={survey.status} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-x-4">
                <Field label="Phone">
                  <TextValue value={client?.phone} />
                </Field>
                <Field label="Email">
                  <TextValue value={client?.email} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-x-4">
                <Field label="Address">
                  <TextValue value={client?.address} />
                </Field>
                <Field label="Maps">
                  {client?.maps_link ? (
                    <a
                      href={client.maps_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Open Maps <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-slate-800">—</p>
                  )}
                </Field>
              </div>
            </div>
          </div>

          <Separator />

          {/* Survey */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
              Survey
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-x-4">
                <Field label="Surveyor">
                  <TextValue value={surveyor?.name} />
                </Field>
                <Field label="Phone">
                  <TextValue value={surveyor?.phone} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-x-4">
                <Field label="Schedule">
                  <TextValue value={formatDateTime(survey.schedule)} />
                </Field>
                <Field label="Remaining">
                  <TextValue value={remaining} />
                </Field>
              </div>

              {survey.notes && (
                <Field label="Notes">
                  <p className="text-sm font-medium text-slate-800 whitespace-pre-wrap">
                    {survey.notes}
                  </p>
                </Field>
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
