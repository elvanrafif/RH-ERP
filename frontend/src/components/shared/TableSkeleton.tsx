import { TableCell, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'

const COL_WIDTHS = ['w-24', 'w-40', 'w-16', 'w-32', 'w-12', 'w-20', 'w-8']

interface TableRowsSkeletonProps {
  rows?: number
  columns: number
}

export function TableRowsSkeleton({ rows = 5, columns }: TableRowsSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow key={rowIdx}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <TableCell key={colIdx}>
              <Skeleton className={`h-4 ${COL_WIDTHS[colIdx % COL_WIDTHS.length]}`} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

interface PageTableSkeletonProps {
  rows?: number
}

export function PageTableSkeleton({ rows = 6 }: PageTableSkeletonProps) {
  return (
    <div className="rounded-md border bg-white shadow-sm">
      <div className="p-3 border-b">
        <Skeleton className="h-8 w-[280px]" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-48 flex-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    </div>
  )
}
