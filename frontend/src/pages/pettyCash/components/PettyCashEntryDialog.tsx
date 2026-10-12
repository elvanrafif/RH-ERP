import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FormDialog } from '@/components/shared/FormDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreatePettyCashEntry } from '@/hooks/usePettyCash'
import { useUpdatePettyCashEntry } from '@/hooks/usePettyCash'
import { pettyCashExpenseSchema, pettyCashTopupSchema } from '@/lib/validations/pettyCash'
import type { PettyCashEntryType } from '@/types/pettyCash'
import type { PettyCashEntry } from '@/types/pettyCash'
import { processReceipts, normalizeReceipts, isAllowedReceiptType, isReceiptWithinSize, isPdfReceipt, RECEIPT_ALLOWED_LABEL, RECEIPT_MAX_SIZE_LABEL } from '@/lib/pettyCash/receipt'
import { formatAmountInput, parseAmountInput } from '@/lib/pettyCash/money'
import { PETTY_CASH_RECEIPT_MAX_COUNT } from '@/lib/constant'
import { NewReceiptThumbnail, StoredReceiptThumbnail } from './ReceiptThumbnail'
import { ReceiptFilePicker } from './ReceiptFilePicker'
import { ReceiptPreviewDialog } from './ReceiptPreviewDialog'

interface PettyCashEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pettyCashId: string
  type: PettyCashEntryType
  remainingBalance: number
  entry?: PettyCashEntry
}

interface NewReceipt {
  id: string
  file: File
  previewUrl: string
}

let receiptIdCounter = 0
const nextReceiptId = () => `receipt-${++receiptIdCounter}`

export function PettyCashEntryDialog({ open, onOpenChange, pettyCashId, type, remainingBalance, entry }: PettyCashEntryDialogProps) {
  const [allowOverdraft, setAllowOverdraft] = useState(false)
  const [warning, setWarning] = useState(false)
  const mutation = useCreatePettyCashEntry()
  const updateMutation = useUpdatePettyCashEntry()
  const [personName, setPersonName] = useState(entry?.person_name ?? '')
  const [amount, setAmount] = useState(entry ? String(entry.amount) : '')
  const [transactionDate, setTransactionDate] = useState(() => entry?.transaction_date ? entry.transaction_date.slice(0, 10) : new Date().toISOString().slice(0, 10))
  const [purpose, setPurpose] = useState(entry?.purpose ?? '')
  const [notes, setNotes] = useState(entry?.notes ?? '')
  const [fieldError, setFieldError] = useState('')
  const [existingReceipts, setExistingReceipts] = useState<string[]>(() => normalizeReceipts(entry?.receipt))
  const [newReceipts, setNewReceipts] = useState<NewReceipt[]>([])
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const [previewNew, setPreviewNew] = useState<NewReceipt | null>(null)

  // Revoke object URLs on unmount to avoid leaks.
  useEffect(() => () => {
    setNewReceipts((current) => {
      current.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      return current
    })
  }, [])

  const totalReceipts = existingReceipts.length + newReceipts.length

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const incoming = Array.from(files).filter((file) => {
      if (!isAllowedReceiptType(file)) {
        toast.error(`${file.name}: only ${RECEIPT_ALLOWED_LABEL} files are allowed`)
        return false
      }
      if (!isReceiptWithinSize(file)) {
        toast.error(`${file.name}: must be ${RECEIPT_MAX_SIZE_LABEL} or smaller`)
        return false
      }
      return true
    })
    if (incoming.length === 0) return
    const remaining = PETTY_CASH_RECEIPT_MAX_COUNT - totalReceipts
    if (remaining <= 0) {
      toast.error(`Maximum ${PETTY_CASH_RECEIPT_MAX_COUNT} receipts per transaction`)
      return
    }
    const accepted = incoming.slice(0, remaining)
    if (incoming.length > remaining) {
      toast.warning(`Only ${remaining} more receipt${remaining > 1 ? 's' : ''} allowed`)
    }
    setNewReceipts((current) => [
      ...current,
      ...accepted.map((file) => ({ id: nextReceiptId(), file, previewUrl: URL.createObjectURL(file) })),
    ])
  }

  const removeNewReceipt = (id: string) => {
    setNewReceipts((current) => {
      const target = current.find((item) => item.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return current.filter((item) => item.id !== id)
    })
  }

  const removeExistingReceipt = (name: string) => {
    setExistingReceipts((current) => current.filter((item) => item !== name))
  }

  const removeAllReceipts = () => {
    newReceipts.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    setNewReceipts([])
    setExistingReceipts([])
  }

  const submitValues = async () => {
    const values = type === 'expense'
      ? { type, person_name: personName, amount, purpose, notes }
      : { type, amount, notes, transaction_date: transactionDate }
    if (type === 'expense') values.transaction_date = transactionDate
    const parsed = (type === 'expense' ? pettyCashExpenseSchema : pettyCashTopupSchema).safeParse(values)
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? 'Please check the form fields')
      return
    }
    setFieldError('')
    const numericAmount = parseAmountInput(amount)
    const availableBalance = remainingBalance + (entry?.type === 'expense' ? entry.amount : 0)
    if (type === 'expense' && numericAmount > availableBalance && !allowOverdraft) {
      setWarning(true)
      return
    }
    try {
      const receipts = newReceipts.length > 0 ? await processReceipts(newReceipts.map((item) => item.file)) : []
      const input = {
        petty_cash_id: pettyCashId,
        type,
        transaction_date: new Date(`${transactionDate}T12:00:00`).toISOString(),
        amount: numericAmount,
        person_name: type === 'expense' ? personName : undefined,
        purpose: type === 'expense' ? purpose : undefined,
        notes,
        receipt: receipts,
        keep_receipts: existingReceipts,
      }
      if (entry) await updateMutation.mutateAsync({ id: entry.id, input })
      else await mutation.mutateAsync(input)
      toast.success(entry ? 'Transaction updated' : type === 'expense' ? 'Expense added' : 'Top-up added')
      newReceipts.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      setPersonName('')
      setAmount('')
      setTransactionDate(new Date().toISOString().slice(0, 10))
      setPurpose('')
      setNotes('')
      setNewReceipts([])
      setExistingReceipts([])
      setAllowOverdraft(false)
      setWarning(false)
      onOpenChange(false)
    } catch {
      toast.error('Failed to save transaction. The petty cash may have been closed.')
    }
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={entry ? 'Edit Transaction' : type === 'expense' ? 'Add Expense' : 'Top Up'} description={type === 'expense' ? 'Record the expense details and attach its receipts.' : 'Add funds to the petty cash balance.'}>
      <form onSubmit={(event) => { event.preventDefault(); void submitValues() }} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {type === 'expense' && <div className="space-y-2"><Label htmlFor="entry-person">Person Name</Label><Input id="entry-person" value={personName} onChange={(event) => setPersonName(event.target.value)} /></div>}
          <div className="space-y-2"><Label htmlFor="entry-amount">Amount</Label><Input id="entry-amount" type="text" inputMode="numeric" value={formatAmountInput(amount)} onChange={(event) => setAmount(event.target.value.replace(/\D/g, ''))} /></div>
          <div className="space-y-2"><Label htmlFor="entry-date">Transaction Date</Label><Input id="entry-date" type="date" value={transactionDate} onChange={(event) => setTransactionDate(event.target.value)} /></div>
          {type === 'expense' && <div className="space-y-2"><Label htmlFor="entry-purpose">Purpose</Label><Input id="entry-purpose" value={purpose} onChange={(event) => setPurpose(event.target.value)} /></div>}
        </div>
        <div className="space-y-2"><Label htmlFor="entry-notes">Notes (optional)</Label><Textarea id="entry-notes" value={notes} onChange={(event) => setNotes(event.target.value)} /></div>
        {type === 'expense' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Receipts ({totalReceipts}/{PETTY_CASH_RECEIPT_MAX_COUNT})</Label>
              {totalReceipts > 0 && (
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={removeAllReceipts}>Remove all</Button>
              )}
            </div>
            {(existingReceipts.length > 0 || newReceipts.length > 0) && (
              <div className="grid grid-cols-5 gap-2">
                {existingReceipts.map((name, index) => (
                  <StoredReceiptThumbnail key={`existing-${name}`} entryId={entry?.id ?? ''} name={name} onPreview={() => setPreviewIndex(index)} onRemove={() => removeExistingReceipt(name)} />
                ))}
                {newReceipts.map((item) => (
                  <NewReceiptThumbnail key={item.id} file={item.file} previewUrl={item.previewUrl} onPreview={() => setPreviewNew(item)} onRemove={() => removeNewReceipt(item.id)} />
                ))}
              </div>
            )}
            <ReceiptFilePicker onFilesSelected={addFiles} disabled={totalReceipts >= PETTY_CASH_RECEIPT_MAX_COUNT} maxCount={PETTY_CASH_RECEIPT_MAX_COUNT} />
          </div>
        )}
        {fieldError && <p role="alert" className="text-sm text-destructive">{fieldError}</p>}
        {warning && <div role="alert" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Balance is insufficient. This amount exceeds the remaining balance. Continue anyway?<div className="mt-3 flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => setWarning(false)}>Cancel</Button><Button type="button" size="sm" onClick={() => { setAllowOverdraft(true); setWarning(false); void submitValues() }}>Continue</Button></div></div>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={mutation.isPending || updateMutation.isPending}>{mutation.isPending || updateMutation.isPending ? 'Saving...' : entry ? 'Save Changes' : 'Save Transaction'}</Button></div>
      </form>
      {entry && previewIndex !== null && existingReceipts.length > 0 && (
        <ReceiptPreviewDialog
          key={`preview-${previewIndex}`}
          open
          onOpenChange={(next) => { if (!next) setPreviewIndex(null) }}
          entryId={entry.id}
          filenames={existingReceipts}
          initialIndex={previewIndex}
        />
      )}
      {previewNew && (
        <FormDialog open onOpenChange={(next) => { if (!next) setPreviewNew(null) }} title={previewNew.file.name} maxWidth="sm:max-w-3xl">
          <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-md bg-slate-50">
            {isPdfReceipt(previewNew.file.name)
              ? <iframe title="Receipt PDF" src={previewNew.previewUrl} className="h-[70vh] w-full" />
              : <img src={previewNew.previewUrl} alt={previewNew.file.name} className="max-h-[70vh] max-w-full object-contain" />}
          </div>
        </FormDialog>
      )}
    </FormDialog>
  )
}
