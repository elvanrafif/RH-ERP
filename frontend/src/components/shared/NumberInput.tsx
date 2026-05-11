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
  decimal?: boolean
}

function formatWithSeparator(val: number): string {
  if (!val && val !== 0) return ''
  return new Intl.NumberFormat('id-ID').format(val)
}

function clamp(val: number, min: number, max?: number): number {
  const lo = Math.max(min, val)
  return max !== undefined ? Math.min(max, lo) : lo
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
  decimal = false,
}: NumberInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [rawDecimal, setRawDecimal] = useState('')

  const displayValue = (() => {
    if (decimal && isFocused) return rawDecimal
    if (isFocused) return value === 0 ? '' : String(value)
    if (value === 0) return ''
    return decimal ? String(value) : formatWithSeparator(value)
  })()

  const handleFocus = () => {
    setIsFocused(true)
    if (decimal) setRawDecimal(value === 0 ? '' : String(value))
  }

  const handleBlur = () => {
    setIsFocused(false)
    if (decimal) {
      const normalized = rawDecimal.replace(',', '.')
      const parsed = normalized === '' ? 0 : parseFloat(normalized)
      onChange(isNaN(parsed) ? 0 : clamp(parsed, min, max))
      setRawDecimal('')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (decimal) {
      // Allow digits, one dot or comma as decimal separator
      const raw = e.target.value.replace(/[^\d.,]/g, '')
      const firstSep = raw.search(/[.,]/)
      const cleaned =
        firstSep === -1
          ? raw
          : raw.slice(0, firstSep + 1) + raw.slice(firstSep + 1).replace(/[.,]/g, '')
      setRawDecimal(cleaned)
      const normalized = cleaned.replace(',', '.')
      const parsed = normalized === '' || normalized.endsWith('.') ? 0 : parseFloat(normalized)
      if (!isNaN(parsed)) onChange(clamp(parsed, min, max))
      return
    }
    const raw = e.target.value.replace(/\D/g, '')
    const parsed = raw === '' ? 0 : Number(raw)
    onChange(clamp(parsed, min, max))
  }

  const increment = () => onChange(clamp(value + step, min, max))
  const decrement = () => onChange(clamp(value - step, min, max))

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
        inputMode={decimal ? 'decimal' : 'numeric'}
        value={displayValue}
        placeholder={isFocused ? '' : placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
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
