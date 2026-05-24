import type { User } from '@/types'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ActiveTab = 'converted' | 'potential' | 'not-converted'

interface ConversionToolbarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  activeTab: ActiveTab
  onTabChange: (tab: ActiveTab) => void
  picFilter: string
  onPicFilterChange: (value: string) => void
  architectureUsers: User[]
  convertedCount: number
  potentialCount: number
  notConvertedCount: number
}

export function ConversionToolbar({
  searchTerm,
  onSearchChange,
  activeTab,
  onTabChange,
  picFilter,
  onPicFilterChange,
  architectureUsers,
  convertedCount,
  potentialCount,
  notConvertedCount,
}: ConversionToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
      <div className="relative flex-1 sm:max-w-[240px]">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search client..."
          className="pl-9 h-9 bg-white w-full"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={activeTab} onValueChange={(v) => onTabChange(v as ActiveTab)}>
        <SelectTrigger className="h-9 bg-white w-52">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="converted">Converted ({convertedCount})</SelectItem>
          <SelectItem value="potential">Potential ({potentialCount})</SelectItem>
          <SelectItem value="not-converted">Not Converted ({notConvertedCount})</SelectItem>
        </SelectContent>
      </Select>
      <Select value={picFilter} onValueChange={onPicFilterChange}>
        <SelectTrigger className="h-9 bg-white w-44">
          <SelectValue placeholder="All PICs" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All PICs</SelectItem>
          {architectureUsers.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.name || u.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
