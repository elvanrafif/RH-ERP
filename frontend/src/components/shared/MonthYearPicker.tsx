import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface MonthYearPickerProps {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function MonthYearPicker({ selected, onSelect }: MonthYearPickerProps) {
  const [viewYear, setViewYear] = useState(
    selected ? selected.getFullYear() : new Date().getFullYear(),
  )

  const selectedKey = selected
    ? `${selected.getFullYear()}-${selected.getMonth()}`
    : null

  const handleSelect = (monthIndex: number) => {
    const key = `${viewYear}-${monthIndex}`
    if (selectedKey === key) {
      onSelect(undefined)
    } else {
      onSelect(new Date(viewYear, monthIndex, 1))
    }
  }

  return (
    <div className="p-3 w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setViewYear((y) => y - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">{viewYear}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setViewYear((y) => y + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-1">
        {MONTHS.map((m, i) => {
          const isActive = selectedKey === `${viewYear}-${i}`
          return (
            <Button
              key={m}
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                'h-9 text-xs font-normal',
                isActive && 'bg-primary text-primary-foreground',
              )}
              onClick={() => handleSelect(i)}
            >
              {format(new Date(viewYear, i, 1), 'MMM')}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
