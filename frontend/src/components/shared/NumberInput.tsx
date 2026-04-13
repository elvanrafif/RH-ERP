import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NumberInputProps {
  value: number
  onChange: (val: number) => void
  step?: number
  min?: number
  max?: number
  placeholder?: string
  className?: string
  inputClassName?: string
  disabled?: boolean
}

function formatWithSeparator(val: number): string {
  if (!val && val !== 0) return ''
  return new Intl.NumberFormat('id-ID').format(val)
}

export function NumberInput({
  value,
  onChange,
  step = 1,
  min = 0,
  max,
  placeholder,
  className,
  inputClassName,
  disabled = false,
}: NumberInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const displayValue = isFocused
    ? value === 0
      ? ''
      : String(value)
    : value === 0
      ? ''
      : formatWithSeparator(value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '')
    const parsed = raw === '' ? 0 : Number(raw)
    onChange(
      max !== undefined
        ? Math.min(max, Math.max(min, parsed))
        : Math.max(min, parsed)
    )
  }

  const increment = () => {
    const next = value + step
    onChange(max !== undefined ? Math.min(max, next) : next)
  }

  const decrement = () => {
    onChange(Math.max(min, value - step))
  }

  return (
    <div
      className={cn(
        'flex items-stretch h-9 rounded-md border border-input bg-transparent shadow-sm transition-colors overflow-hidden',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        placeholder={isFocused ? '' : placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          'flex-1 min-w-0 px-2.5 text-xs bg-transparent outline-none tabular-nums',
          disabled && 'cursor-not-allowed',
          inputClassName
        )}
      />
      <div className="flex flex-col border-l border-input">
        <button
          type="button"
          onClick={increment}
          disabled={disabled}
          className="flex-1 flex items-center justify-center px-1.5 hover:bg-muted transition-colors disabled:cursor-not-allowed"
          tabIndex={-1}
        >
          <ChevronUp className="h-2.5 w-2.5 text-muted-foreground" />
        </button>
        <div className="h-px bg-input" />
        <button
          type="button"
          onClick={decrement}
          disabled={disabled}
          className="flex-1 flex items-center justify-center px-1.5 hover:bg-muted transition-colors disabled:cursor-not-allowed"
          tabIndex={-1}
        >
          <ChevronDown className="h-2.5 w-2.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
