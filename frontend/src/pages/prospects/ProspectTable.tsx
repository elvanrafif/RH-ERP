import type { Prospect } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Eye, Pencil } from 'lucide-react'
import { RowActions } from '@/components/shared/RowActions'
import { EmptyState } from '@/components/shared/EmptyState'
import { TableRowsSkeleton } from '@/components/shared/TableSkeleton'
import { formatDateTime, formatTimeUntil } from '@/lib/helpers'

interface ProspectTableProps {
  prospects: Prospect[]
  isLoading: boolean
  onView: (prospect: Prospect) => void
  onEdit: (prospect: Prospect) => void
}

export function ProspectTable({
  prospects,
  isLoading,
  onView,
  onEdit,
}: ProspectTableProps) {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 min-h-0 [&>div]:h-full">
        <Table className="min-w-[980px]">
          <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
              <TableHead className="min-w-[40px] w-[40px]">#</TableHead>
              <TableHead className="min-w-[210px]">Client</TableHead>
              <TableHead className="min-w-[110px]">Needs</TableHead>
              <TableHead className="min-w-[150px]">Details</TableHead>
              <TableHead className="min-w-[160px]">Meeting Schedule</TableHead>
              <TableHead className="min-w-[160px]">Survey Schedule</TableHead>
              <TableHead className="min-w-[52px] w-[52px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRowsSkeleton columns={7} rows={8} />
            ) : prospects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <EmptyState title="No prospects found." />
                </TableCell>
              </TableRow>
            ) : (
              prospects.map((prospect, index) => (
                <TableRow
                  key={prospect.id}
                  className="cursor-pointer hover:bg-slate-50/80"
                  onClick={() => onView(prospect)}
                >
                  <TableCell className="text-muted-foreground text-xs">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-900">
                      {prospect.client_name || '—'}
                      {prospect.phone && (
                        <span className="mx-1.5 text-slate-300">|</span>
                      )}
                      <span className="text-slate-500">{prospect.phone}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {prospect.instagram && (
                        <span className="text-slate-400">@{prospect.instagram}</span>
                      )}
                      {prospect.instagram && prospect.address && (
                        <span className="mx-1 text-slate-300">·</span>
                      )}
                      {prospect.address && <span>{prospect.address}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {prospect.needs?.length ? prospect.needs.join(', ') : '—'}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const parts = [
                        prospect.land_size ? `${prospect.land_size} m²` : null,
                        prospect.floor ? `${prospect.floor} Lt` : null,
                        prospect.renovation_type ?? null,
                      ].filter(Boolean)
                      return parts.length ? (
                        <span className="text-xs text-slate-600">
                          {parts.join(' · ')}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(prospect.meeting_schedule)}
                    </div>
                    {(() => {
                      const t = formatTimeUntil(prospect.meeting_schedule)
                      if (!t) return null
                      return (
                        <div
                          className={`text-xs font-medium mt-0.5 ${t.isOverdue ? 'text-red-500' : 'text-amber-600'}`}
                        >
                          {t.label}
                        </div>
                      )
                    })()}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(prospect.survey_schedule)}
                    </div>
                    {(() => {
                      const t = formatTimeUntil(prospect.survey_schedule)
                      if (!t) return null
                      return (
                        <div
                          className={`text-xs font-medium mt-0.5 ${t.isOverdue ? 'text-red-500' : 'text-amber-600'}`}
                        >
                          {t.label}
                        </div>
                      )
                    })()}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <RowActions
                      actions={[
                        {
                          label: 'View Detail',
                          icon: Eye,
                          onClick: () => onView(prospect),
                        },
                        {
                          label: 'Edit',
                          icon: Pencil,
                          onClick: () => onEdit(prospect),
                          separator: true,
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
  )
}
