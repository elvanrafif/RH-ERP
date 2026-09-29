import { useEffect, useState } from 'react'
import { FormDialog } from '@/components/shared/FormDialog'
import { Skeleton } from '@/components/ui/skeleton'
import { getReceiptUrl } from '@/lib/pettyCash/receipt'
import type { PettyCashEntry } from '@/types/pettyCash'

interface ReceiptPreviewDialogProps {
  entry: PettyCashEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReceiptPreviewDialog({ entry, open, onOpenChange }: ReceiptPreviewDialogProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (open && entry?.receipt) {
      const isImage = entry.receipt.toLowerCase().endsWith('.webp') || /\.(png|jpe?g|gif)$/i.test(entry.receipt)
      void getReceiptUrl({ id: entry.id, collectionId: 'petty_cash_entry', receipt: entry.receipt }, isImage)
        .then((nextUrl) => { if (active) setUrl(nextUrl) })
        .catch(() => { if (active) setError('Unable to load receipt preview') })
    }
    return () => { active = false }
  }, [entry, open])

  const isPdf = entry?.receipt?.toLowerCase().endsWith('.pdf')
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Receipt Preview" maxWidth="sm:max-w-3xl">
      <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-md bg-slate-50">
        {error ? <p className="text-sm text-destructive">{error}</p> : !url ? <Skeleton className="h-64 w-full" /> : isPdf ? <iframe title="Expense receipt PDF" src={url} className="h-[70vh] w-full" /> : <img src={url} alt="Expense receipt" className="max-h-[70vh] max-w-full object-contain" />}
      </div>
    </FormDialog>
  )
}
