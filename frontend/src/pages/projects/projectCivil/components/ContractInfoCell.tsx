import type { Project } from '@/types'
import { CalendarRange, ArrowRight } from 'lucide-react'
import { formatDate, formatRupiah, calculateDuration } from '@/lib/helpers'

interface ContractInfoCellProps {
  project: Project
  isSuperAdmin: boolean
}

export function ContractInfoCell({ project, isSuperAdmin }: ContractInfoCellProps) {
  const value = project.expand?.invoice_id?.total_amount
  const start = project.start_date
  const end = project.end_date
  const duration = start && end ? calculateDuration(start, end) : ''

  return (
    <div className="flex flex-col min-w-[140px]">
      {isSuperAdmin && (
        <div className="flex items-center justify-between pr-2">
          <span className="font-bold text-sm text-slate-800">
            {formatRupiah(value || 0)}
          </span>
        </div>
      )}
      <div className="flex items-center text-[11px] text-slate-500 bg-slate-50/50 p-1 rounded w-fit">
        <CalendarRange className="h-3 w-3 mr-1.5 text-slate-400" />
        {start && end ? (
          <div className="flex items-center gap-1">
            <span>{formatDate(start)}</span>
            <ArrowRight className="h-2.5 w-2.5 text-slate-300" />
            <span>{formatDate(end)}</span>
          </div>
        ) : (
          <span className="italic text-slate-400">Schedule not set</span>
        )}
      </div>
      {duration && (
        <span className="text-[10px] text-slate-600 pl-1 mt-0.5">
          <span className="text-slate-400">Total:</span> {duration}
        </span>
      )}
    </div>
  )
}
