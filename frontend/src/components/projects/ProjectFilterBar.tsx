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

interface ProjectFilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterPic: string
  onFilterPicChange: (value: string) => void
  filterVendor?: string
  onFilterVendorChange?: (value: string) => void
  filterStatus: ProjectStatusFilter
  onFilterStatusChange: (value: ProjectStatusFilter) => void
  filterDeadline: DeadlineFilter
  onFilterDeadlineChange: (value: DeadlineFilter) => void
  deadlineWarningDays: number
  resultCount: number
  hasActiveFilters: boolean
  onResetFilters: () => void
  isCivil: boolean
  isInterior?: boolean
  users: User[]
  civilVendors: Vendor[]
  interiorVendors?: Vendor[]
  projectType: string
  className?: string
}

export function ProjectFilterBar({
  searchQuery,
  onSearchChange,
  filterPic,
  onFilterPicChange,
  filterVendor = 'all',
  onFilterVendorChange,
  filterStatus,
  onFilterStatusChange,
  filterDeadline,
  onFilterDeadlineChange,
  deadlineWarningDays,
  resultCount,
  hasActiveFilters,
  onResetFilters,
  isCivil,
  isInterior = false,
  users,
  civilVendors,
  interiorVendors = [],
  projectType,
  className,
}: ProjectFilterBarProps) {
  return (
    <div
      className={
        className ??
        'flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between shrink-0'
      }
    >
      <div className="flex flex-1 gap-2 w-full min-w-0 items-center">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search client"
            className="pl-8 h-9 bg-white"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="w-[140px] md:w-[180px] relative shrink-0">
          {filterPic && filterPic !== 'all' && (
            <span className="absolute -top-1 -right-1 z-10 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
          )}
          <Select value={filterPic} onValueChange={onFilterPicChange}>
            <SelectTrigger
              className={cn(
                'h-9 bg-white transition-colors',
                filterPic && filterPic !== 'all'
                  ? 'border-primary/50 ring-1 ring-primary/30 text-primary'
                  : ''
              )}
            >
              <Filter
                className={cn(
                  'w-3.5 h-3.5 mr-2',
                  filterPic && filterPic !== 'all'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              />
              <SelectValue placeholder="Filter PIC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All PICs</SelectItem>
              <SelectItem value="unassigned">-- Unassigned --</SelectItem>
              {isCivil
                ? civilVendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                      {!v.isActive && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          (Inactive)
                        </span>
                      )}
                    </SelectItem>
                  ))
                : users
                    .filter(
                      (u) =>
                        u.division?.toLowerCase() ===
                        PROJECT_TYPE_TO_DIVISION[projectType]
                    )
                    .map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name || u.email}
                      </SelectItem>
                    ))}
            </SelectContent>
          </Select>
        </div>

        {isInterior && onFilterVendorChange && (
          <div className="w-[140px] md:w-[180px] relative shrink-0">
            {filterVendor && filterVendor !== 'all' && (
              <span className="absolute -top-1 -right-1 z-10 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
            )}
            <Select value={filterVendor} onValueChange={onFilterVendorChange}>
              <SelectTrigger
                className={cn(
                  'h-9 bg-white transition-colors',
                  filterVendor && filterVendor !== 'all'
                    ? 'border-primary/50 ring-1 ring-primary/30 text-primary'
                    : ''
                )}
              >
                <Filter
                  className={cn(
                    'w-3.5 h-3.5 mr-2',
                    filterVendor && filterVendor !== 'all'
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  )}
                />
                <SelectValue placeholder="Filter Vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                {interiorVendors.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                    {!v.isActive && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (Inactive)
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="w-[130px] md:w-[150px] relative shrink-0">
          {filterStatus !== 'active' && (
            <span className="absolute -top-1 -right-1 z-10 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
          )}
          <Select
            value={filterStatus}
            onValueChange={(v) =>
              onFilterStatusChange(v as ProjectStatusFilter)
            }
          >
            <SelectTrigger
              className={cn(
                'h-9 bg-white transition-colors',
                filterStatus !== 'active'
                  ? 'border-primary/50 ring-1 ring-primary/30 text-primary'
                  : ''
              )}
            >
              <CircleDot
                className={cn(
                  'w-3.5 h-3.5 mr-2',
                  filterStatus !== 'active'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="finished">Finished</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[160px] md:w-[190px] relative shrink-0">
          {filterDeadline !== 'all' && (
            <span className="absolute -top-1 -right-1 z-10 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
          )}
          <Select
            value={filterDeadline}
            onValueChange={(v) => onFilterDeadlineChange(v as DeadlineFilter)}
          >
            <SelectTrigger
              className={cn(
                'h-9 bg-white transition-colors',
                filterDeadline !== 'all'
                  ? 'border-primary/50 ring-1 ring-primary/30 text-primary'
                  : ''
              )}
            >
              <Clock
                className={cn(
                  'w-3.5 h-3.5 mr-2',
                  filterDeadline !== 'all'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              />
              <SelectValue placeholder="Deadline" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deadlines</SelectItem>
              <SelectItem value="near">
                Near Deadline (≤{deadlineWarningDays} hari)
              </SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onResetFilters}
            title="Reset Filter"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  )
}
