import type { Survey } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RowActions } from '@/components/shared/RowActions'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableRowsSkeleton } from '@/components/shared/TableSkeleton'
import { formatDateTime, getRemainingTime } from '@/lib/helpers'
import { SURVEY_STATUS } from '@/lib/constant'
import { ClipboardList, Pencil, Trash2 } from 'lucide-react'

interface SurveyTableProps {
  surveys: Survey[]
  isLoading: boolean
  onView: (survey: Survey) => void
  onEdit?: (survey: Survey) => void
  onDelete?: (survey: Survey) => void
}

function StatusBadge({ status }: { status: string }) {
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

export function SurveyTable({
  surveys,
  isLoading,
  onView,
  onEdit,
  onDelete,
}: SurveyTableProps) {
  const hasActions = !!(onEdit || onDelete)
  const colSpan = hasActions ? 6 : 5

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="w-[200px] text-right pr-6">
                  Surveyor
                </TableHead>
                <TableHead className="w-[220px] text-right pr-6">
                  Schedule
                </TableHead>
                <TableHead className="w-[130px] text-right pr-6">
                  Status
                </TableHead>
                {hasActions && <TableHead className="w-[60px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton rows={5} columns={colSpan} />
              ) : surveys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colSpan} className="h-60">
                    <EmptyState
                      icon={
                        <ClipboardList className="h-8 w-8 text-slate-400" />
                      }
                      title="No surveys yet"
                      description="Create your first survey appointment to get started"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                surveys.map((survey, index) => (
                  <TableRow
                    key={survey.id}
                    className="h-16 cursor-pointer"
                    onClick={() => onView(survey)}
                  >
                    <TableCell className="text-slate-400 text-xs tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {survey.expand?.client?.company_name ?? '—'}
                    </TableCell>
                    <TableCell className="text-slate-600 text-right pr-6">
                      {survey.expand?.surveyor?.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <p className="text-slate-600 tabular-nums text-sm">
                        {formatDateTime(survey.schedule)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {getRemainingTime(survey.schedule)}
                      </p>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end">
                        <StatusBadge status={survey.status} />
                      </div>
                    </TableCell>
                    {hasActions && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <RowActions
                          actions={[
                            ...(onEdit
                              ? [
                                  {
                                    label: 'Edit',
                                    icon: Pencil,
                                    onClick: () => onEdit(survey),
                                  },
                                ]
                              : []),
                            ...(onDelete
                              ? [
                                  {
                                    label: 'Delete',
                                    icon: Trash2,
                                    onClick: () => onDelete(survey),
                                    variant: 'destructive' as const,
                                  },
                                ]
                              : []),
                          ]}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
