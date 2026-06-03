import { useState } from 'react'
import { ArrowUpDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface SortPopoverProps {
  options: Array<{ value: string; label: string }>
  value: string | null
  onChange: (value: string | null) => void
}

export function SortPopover({ options, value, onChange }: SortPopoverProps) {
  const [open, setOpen] = useState(false)
  const isActive = value !== null

  function handleSelect(val: string) {
    onChange(val)
    setOpen(false)
  }

  function handleClear() {
    onChange(null)
    setOpen(false)
  }

  return (
    <div className="relative shrink-0">
      {isActive && (
        <span className="absolute -top-1 -right-1 z-10 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-9 gap-1.5',
              isActive && 'border-primary/50 ring-1 ring-primary/30 text-primary'
            )}
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
            Sort
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-52 p-2" align="end">
          <p className="text-xs font-semibold text-muted-foreground px-2 py-1">Sort by</p>
          <div className="mt-1 flex flex-col gap-0.5">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={cn(
                  'flex items-center justify-between w-full px-2 py-1.5 rounded text-sm text-left transition-colors',
                  value === opt.value
                    ? 'bg-primary/5 text-primary font-medium'
                    : 'hover:bg-slate-50 text-slate-700'
                )}
              >
                {opt.label}
                {value === opt.value && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            ))}
          </div>
          {isActive && (
            <>
              <div className="my-2 border-t" />
              <button
                onClick={handleClear}
                className="w-full px-2 py-1.5 rounded text-sm text-left text-muted-foreground hover:bg-slate-50 transition-colors"
              >
                Clear Sort
              </button>
            </>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
