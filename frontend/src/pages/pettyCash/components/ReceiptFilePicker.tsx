import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RECEIPT_ALLOWED_LABEL, RECEIPT_MAX_SIZE_LABEL } from '@/lib/pettyCash/receipt'

interface ReceiptFilePickerProps {
  onFilesSelected: (files: FileList | null) => void
  disabled?: boolean
  maxCount: number
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,application/pdf,.jpg,.jpeg,.png,.webp,.gif,.pdf'

/**
 * Compact file picker for receipts. Replaces the native input (which shows the
 * browser's "No file chosen" text) with a slim, clickable, keyboard-accessible
 * bar that also accepts drag & drop. The real input stays hidden and is
 * triggered via ref so multi-select and the OS file dialog behave identically.
 */
export function ReceiptFilePicker({ onFilesSelected, disabled, maxCount }: ReceiptFilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const openPicker = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    if (disabled) return
    onFilesSelected(event.dataTransfer.files)
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={`Add receipts, up to ${maxCount} files`}
      title={disabled ? 'Receipt limit reached' : `Add receipts — ${RECEIPT_ALLOWED_LABEL}, max ${RECEIPT_MAX_SIZE_LABEL} each`}
      onClick={openPicker}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openPicker()
        }
      }}
      onDragOver={(event) => {
        if (disabled) return
        event.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex items-center gap-2 rounded-md border border-dashed px-2.5 py-2 text-left transition-colors outline-none',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring',
        disabled
          ? 'cursor-not-allowed border-border bg-muted/40 opacity-60'
          : isDragging
            ? 'cursor-pointer border-primary bg-primary/5'
            : 'cursor-pointer border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40'
      )}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-background text-slate-500 shadow-sm">
        <UploadCloud className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-slate-700">
          {disabled ? 'Receipt limit reached' : 'Add receipts'}
        </span>
        <span className="block truncate text-[11px] text-muted-foreground">
          Click or drop — up to {maxCount} files, max {RECEIPT_MAX_SIZE_LABEL} each · {RECEIPT_ALLOWED_LABEL}
        </span>
      </span>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          onFilesSelected(event.target.files)
          event.target.value = ''
        }}
      />
    </div>
  )
}
