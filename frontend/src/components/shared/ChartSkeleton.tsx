import { Skeleton } from '@/components/ui/skeleton'

const BAR_HEIGHTS = ['h-16', 'h-28', 'h-20', 'h-36', 'h-24', 'h-40', 'h-32']

export function ChartSkeleton() {
  return (
    <div className="h-[400px] flex flex-col gap-4 p-4">
      <Skeleton className="h-6 w-48" />
      <div className="flex-1 flex items-end gap-3 pt-4">
        {BAR_HEIGHTS.map((h, idx) => (
          <Skeleton key={idx} className={`flex-1 ${h} rounded-t-sm`} />
        ))}
      </div>
      <Skeleton className="h-px w-full" />
    </div>
  )
}
