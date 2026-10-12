import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { FormDialog } from '@/components/shared/FormDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getReceiptUrl, isImageReceipt, isPdfReceipt } from '@/lib/pettyCash/receipt'

interface ReceiptPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entryId: string
  filenames: string[]
  initialIndex?: number
}

export function ReceiptPreviewDialog({ open, onOpenChange, entryId, filenames, initialIndex = 0 }: ReceiptPreviewDialogProps) {
  const [index, setIndex] = useState(() => Math.min(Math.max(initialIndex, 0), Math.max(filenames.length - 1, 0)))
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const current = filenames[index]

  useEffect(() => {
    let active = true
    if (open && entryId && current) {
      void getReceiptUrl({ id: entryId, collectionId: 'petty_cash_entry' }, current, isImageReceipt(current))
        .then((nextUrl) => { if (active) { setUrl(nextUrl); setError('') } })
        .catch(() => { if (active) { setUrl(''); setError('Unable to load receipt preview') } })
    }
    return () => { active = false }
  }, [entryId, open, current])

  const isPdf = current ? isPdfReceipt(current) : false

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={filenames.length > 1 ? `Receipt Preview (${index + 1} / ${filenames.length})` : 'Receipt Preview'}
      maxWidth="sm:max-w-3xl"
    >
      <div className="space-y-3">
        <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-md bg-slate-50">
          {error
            ? <p className="text-sm text-destructive">{error}</p>
            : !url
              ? <Skeleton className="h-64 w-full" />
              : isPdf
                ? <iframe title="Expense receipt PDF" src={url} className="h-[70vh] w-full" />
                : <img src={url} alt="Expense receipt" className="max-h-[70vh] max-w-full object-contain" />}
        </div>
        {filenames.length > 1 && (
          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" size="sm" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
              <ChevronLeft className="mr-1 h-4 w-4" />Previous
            </Button>
            <span className="max-w-[60%] truncate text-sm text-muted-foreground">{current}</span>
            <Button type="button" variant="outline" size="sm" disabled={index >= filenames.length - 1} onClick={() => setIndex((i) => Math.min(filenames.length - 1, i + 1))}>
              Next<ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </FormDialog>
  )
}
