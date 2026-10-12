import { useEffect, useState } from 'react'
import { FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getReceiptUrl, isPdfReceipt } from '@/lib/pettyCash/receipt'

interface ReceiptThumbnailProps {
  entryId: string
  name: string
  onRemove?: () => void
  onPreview?: () => void
}

/** Compact tile for an already-stored receipt: preview square + filename. */
export function StoredReceiptThumbnail({ entryId, name, onRemove, onPreview }: ReceiptThumbnailProps) {
  const [url, setUrl] = useState('')
  const isPdf = isPdfReceipt(name)

  useEffect(() => {
    let active = true
    if (isPdf) return
    void getReceiptUrl({ id: entryId, collectionId: 'petty_cash_entry' }, name, true)
      .then((next) => { if (active) setUrl(next) })
      .catch(() => { if (active) setUrl('') })
    return () => { active = false }
  }, [entryId, name, isPdf])

  return (
    <div className="group relative w-full">
      <button
        type="button"
        onClick={onPreview}
        title={name}
        className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-border bg-slate-50 transition-colors hover:border-primary/50"
        aria-label={`Preview ${name}`}
      >
        {isPdf
          ? <FileText className="h-5 w-5 text-slate-400" />
          : url
            ? <img src={url} alt={name} className="h-full w-full object-cover" />
            : <Skeleton className="h-full w-full" />}
      </button>
      <p className="mt-0.5 truncate text-[10px] leading-tight text-slate-500" title={name}>{name}</p>
      {onRemove && (
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="absolute -right-1.5 -top-1.5 h-5 w-5 rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          aria-label={`Remove ${name}`}
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

interface NewReceiptThumbnailProps {
  file: File
  previewUrl: string
  onRemove?: () => void
  onPreview?: () => void
}

/** Compact tile for a not-yet-uploaded file: preview square + filename. */
export function NewReceiptThumbnail({ file, previewUrl, onRemove, onPreview }: NewReceiptThumbnailProps) {
  const isPdf = file.type === 'application/pdf'
  return (
    <div className="group relative w-full">
      <button
        type="button"
        onClick={onPreview}
        title={file.name}
        className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-md border border-border bg-slate-50 transition-colors hover:border-primary/50"
        aria-label={`Preview ${file.name}`}
      >
        {isPdf
          ? <FileText className="h-5 w-5 text-slate-400" />
          : <img src={previewUrl} alt={file.name} className="h-full w-full object-cover" />}
      </button>
      <p className="mt-0.5 truncate text-[10px] leading-tight text-slate-500" title={file.name}>{file.name}</p>
      {onRemove && (
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="absolute -right-1.5 -top-1.5 h-5 w-5 rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          aria-label={`Remove ${file.name}`}
          onClick={onRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
