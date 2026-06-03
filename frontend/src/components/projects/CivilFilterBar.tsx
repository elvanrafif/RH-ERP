import type { ProjectStatusFilter } from '@/hooks/useProjects'
import type { DeadlineFilter } from '@/hooks/useProjectFilters'
import type { User, Vendor } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, Filter, CircleDot, Clock, LayoutList } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PROJECT_TYPE_TO_DIVISION } from '@/lib/constant'

interface CivilFilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterPic: string
  onFilterPicChange: (value: string) => void
  filterManagedBy: string
  onFilterManagedByChange: (value: string) => void
  filterStatus: ProjectStatusFilter
  onFilterStatusChange: (value: ProjectStatusFilter) => void
  filterDeadline: DeadlineFilter
  onFilterDeadlineChange: (value: DeadlineFilter) => void
  deadlineWarningDays: number
  hasActiveFilters: boolean
  onResetFilters: () => void
  vendors: Vendor[]
  users: User[]
  className?: string
}

const ACTIVE = 'border-primary/50 ring-1 ring-primary/30 text-primary'

export function CivilFilterBar({
  searchQuery,
  onSearchChange,
  filterPic,
  onFilterPicChange,
  filterManagedBy,
  onFilterManagedByChange,
  filterStatus,
  onFilterStatusChange,
  filterDeadline,
  onFilterDeadlineChange,
  deadlineWarningDays,
  hasActiveFilters,
  onResetFilters,
  vendors,
  users,
  className,
}: CivilFilterBarProps) {
  const picActive = filterPic && filterPic !== 'all'
  const managedByActive = filterManagedBy && filterManagedBy !== 'all'
  const statusActive = filterStatus !== 'all'
  const deadlineActive = filterDeadline !== 'all'
  const civilUsers = users.filter(
    (u) => u.division?.toLowerCase() === PROJECT_TYPE_TO_DIVISION['civil']
  )

  return (
    <div className={className ?? 'flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between shrink-0'}>
      <div className="flex flex-wrap gap-2 w-full items-center">
        <div className="relative flex-1 min-w-[180px] sm:max-w-[240px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search client" className="pl-8 h-9 bg-white" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} />
        </div>

        <div className="flex-1 min-w-[120px] max-w-[180px] relative">
          {picActive && <span className="absolute -top-1 -right-1 z-10 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />}
          <Select value={filterPic} onValueChange={onFilterPicChange}>
            <SelectTrigger className={cn('h-9 bg-white transition-colors', picActive ? ACTIVE : '')}>
              <Filter className={cn('w-3.5 h-3.5 mr-2', picActive ? 'text-primary' : 'text-muted-foreground')} />
              <SelectValue placeholder="Filter PIC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PICs</SelectItem>
              <SelectItem value="unassigned">-- Unassigned --</SelectItem>
              {vendors.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                  {!v.isActive && <span className="ml-1 text-xs text-muted-foreground">(Inactive)</span>}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[120px] max-w-[180px] relative">
          {managedByActive && <span className="absolute -top-1 -right-1 z-10 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />}
          <Select value={filterManagedBy} onValueChange={onFilterManagedByChange}>
            <SelectTrigger className={cn('h-9 bg-white transition-colors', managedByActive ? ACTIVE : '')}>
              <LayoutList className={cn('w-3.5 h-3.5 mr-2', managedByActive ? 'text-primary' : 'text-muted-foreground')} />
              <SelectValue placeholder="Managed By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Managers</SelectItem>
              <SelectItem value="unassigned">-- Unassigned --</SelectItem>
              {civilUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>{u.name || u.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[190px] max-w-[250px] relative">
          {statusActive && <span className="absolute -top-1 -right-1 z-10 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />}
          <Select value={filterStatus} onValueChange={(v) => onFilterStatusChange(v as ProjectStatusFilter)}>
            <SelectTrigger className={cn('h-9 bg-white transition-colors', statusActive ? ACTIVE : '')}>
              <CircleDot className={cn('w-3.5 h-3.5 mr-2', statusActive ? 'text-primary' : 'text-muted-foreground')} />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active (Building + Finishing)</SelectItem>
              <SelectItem value="building">Building</SelectItem>
              <SelectItem value="finishing">Finishing</SelectItem>
              <SelectItem value="finished">Finished</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 min-w-[160px] max-w-[220px] relative">
          {deadlineActive && <span className="absolute -top-1 -right-1 z-10 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />}
          <Select value={filterDeadline} onValueChange={(v) => onFilterDeadlineChange(v as DeadlineFilter)}>
            <SelectTrigger className={cn('h-9 bg-white transition-colors', deadlineActive ? ACTIVE : '')}>
              <Clock className={cn('w-3.5 h-3.5 mr-2', deadlineActive ? 'text-primary' : 'text-muted-foreground')} />
              <SelectValue placeholder="Deadline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deadlines</SelectItem>
              <SelectItem value="near">Near Deadline (≤{deadlineWarningDays} hari)</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={onResetFilters} title="Reset Filter">
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  )
}
