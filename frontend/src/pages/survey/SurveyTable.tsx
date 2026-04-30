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
import { formatDateTime } from '@/lib/helpers'
import { ClipboardList, Pencil, Trash2 } from 'lucide-react'

interface SurveyTableProps {
  surveys: Survey[]
  isLoading: boolean
  onEdit: (survey: Survey) => void
  onDelete: (survey: Survey) => void
}

export function SurveyTable({
  surveys,
  isLoading,
  onEdit,
  onDelete,
}: SurveyTableProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead className="w-[220px]">Client</TableHead>
                <TableHead className="w-[180px]">Surveyor</TableHead>
                <TableHead className="w-[200px]">Schedule</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRowsSkeleton rows={5} columns={6} />
              ) : surveys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-60">
                    <EmptyState
                      icon={ClipboardList}
                      title="No surveys yet"
                      description="Create your first survey appointment to get started"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                surveys.map((survey, index) => (
                  <TableRow
                    key={survey.id}
                    className="h-14 cursor-pointer"
                    onClick={() => onEdit(survey)}
                  >
                    <TableCell className="text-slate-400 text-xs tabular-nums">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {survey.expand?.client?.company_name ?? '—'}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {survey.expand?.surveyor?.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-slate-600 tabular-nums">
                      {formatDateTime(survey.schedule)}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {survey.notes
                        ? survey.notes.length > 60
                          ? survey.notes.slice(0, 60) + '…'
                          : survey.notes
                        : '—'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <RowActions
                        actions={[
                          {
                            label: 'Edit',
                            icon: Pencil,
                            onClick: () => onEdit(survey),
                          },
                          {
                            label: 'Delete',
                            icon: Trash2,
                            onClick: () => onDelete(survey),
                            variant: 'destructive',
                          },
                        ]}
                      />
                    </TableCell>
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
