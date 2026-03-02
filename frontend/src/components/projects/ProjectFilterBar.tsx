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
import { Search, X, Filter } from 'lucide-react'
import { SipilPic } from '@/lib/constant'

interface ProjectFilterBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  filterPic: string
  onFilterPicChange: (value: string) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
  isCivil: boolean
  users: User[]
  projectType: string
}

export function ProjectFilterBar({
  searchQuery,
  onSearchChange,
  filterPic,
  onFilterPicChange,
  hasActiveFilters,
  onResetFilters,
  isCivil,
  users,
  projectType,
}: ProjectFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-3 items-start sm:items-center justify-between shrink-0">
      <div className="flex flex-1 gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search client"
            className="pl-8 h-9 bg-white"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="w-[180px]">
          <Select value={filterPic} onValueChange={onFilterPicChange}>
            <SelectTrigger className="h-9 bg-white">
              <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
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
