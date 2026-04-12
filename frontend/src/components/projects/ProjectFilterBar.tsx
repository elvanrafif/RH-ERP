import type { ProjectStatusFilter } from '@/hooks/useProjects'
import type { User } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, Filter, CircleDot } from 'lucide-react'
import { SipilPic } from '@/lib/constant'
import { cn } from '@/lib/utils'

interface ProjectFilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterPic: string
  onFilterPicChange: (value: string) => void
  filterStatus: ProjectStatusFilter
  onFilterStatusChange: (value: ProjectStatusFilter) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
  isCivil: boolean
  users: User[]
  projectType: string
  className?: string
}

export function ProjectFilterBar({
  searchQuery,
  onSearchChange,
  filterPic,
  onFilterPicChange,
  filterStatus,
  onFilterStatusChange,
  hasActiveFilters,
  onResetFilters,
  isCivil,
  users,
  projectType,
  className,
}: ProjectFilterBarProps) {
  return (
    <div
      className={
        className ??
        'flex flex-col sm:flex-row gap-3 mb-3 items-start sm:items-center justify-between shrink-0'
      }
    >
      <div className="flex flex-1 gap-2 w-full min-w-0">
        <div className="relative flex-1 min-w-0 md:max-w-xs">
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
                ? SipilPic.map((pic: string) => (
                    <SelectItem key={pic} value={pic}>
                      {pic}
                    </SelectItem>
                  ))
                : users
                    .filter((u) => u.division?.toLowerCase() === projectType)
                    .map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name || u.email}
                      </SelectItem>
                    ))}
            </SelectContent>
          </Select>
        </div>

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
