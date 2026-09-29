import { useRef, useState } from 'react'
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
import { processReceipt } from '@/lib/pettyCash/receipt'
import { formatAmountInput, parseAmountInput } from '@/lib/pettyCash/money'

interface PettyCashEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pettyCashId: string
  type: PettyCashEntryType
  remainingBalance: number
  entry?: PettyCashEntry
}

export function PettyCashEntryDialog({ open, onOpenChange, pettyCashId, type, remainingBalance, entry }: PettyCashEntryDialogProps) {
  const [allowOverdraft, setAllowOverdraft] = useState(false)
  const [warning, setWarning] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const mutation = useCreatePettyCashEntry()
  const updateMutation = useUpdatePettyCashEntry()
  const [personName, setPersonName] = useState(entry?.person_name ?? '')
  const [amount, setAmount] = useState(entry ? String(entry.amount) : '')
  const [transactionDate, setTransactionDate] = useState(() => entry?.transaction_date ? entry.transaction_date.slice(0, 10) : new Date().toISOString().slice(0, 10))
  const [purpose, setPurpose] = useState(entry?.purpose ?? '')
  const [notes, setNotes] = useState(entry?.notes ?? '')
  const [fieldError, setFieldError] = useState('')

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
      const source = fileRef.current?.files?.[0]
      const receipt = source ? await processReceipt(source) : undefined
      const input = {
        petty_cash_id: pettyCashId,
        type,
        transaction_date: new Date(`${transactionDate}T12:00:00`).toISOString(),
        amount: numericAmount,
        person_name: type === 'expense' ? personName : undefined,
        purpose: type === 'expense' ? purpose : undefined,
        notes,
        receipt,
      }
      if (entry) await updateMutation.mutateAsync({ id: entry.id, input })
      else await mutation.mutateAsync(input)
      toast.success(entry ? 'Transaction updated' : type === 'expense' ? 'Expense added' : 'Top-up added')
      setPersonName('')
      setAmount('')
      setTransactionDate(new Date().toISOString().slice(0, 10))
      setPurpose('')
      setNotes('')
      setAllowOverdraft(false)
      setWarning(false)
      onOpenChange(false)
    } catch {
      toast.error('Failed to save transaction. The petty cash may have been closed.')
    }
  }

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={entry ? 'Edit Transaction' : type === 'expense' ? 'Add Expense' : 'Top Up'} description={type === 'expense' ? 'Record the expense details and attach its receipt.' : 'Add funds to the petty cash balance.'}>
      <form onSubmit={(event) => { event.preventDefault(); void submitValues() }} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {type === 'expense' && <div className="space-y-2"><Label htmlFor="entry-person">Person Name</Label><Input id="entry-person" value={personName} onChange={(event) => setPersonName(event.target.value)} /></div>}
          <div className="space-y-2"><Label htmlFor="entry-amount">Amount</Label><Input id="entry-amount" type="text" inputMode="numeric" value={formatAmountInput(amount)} onChange={(event) => setAmount(event.target.value.replace(/\D/g, ''))} /></div>
          <div className="space-y-2"><Label htmlFor="entry-date">Transaction Date</Label><Input id="entry-date" type="date" value={transactionDate} onChange={(event) => setTransactionDate(event.target.value)} /></div>
          {type === 'expense' && <div className="space-y-2"><Label htmlFor="entry-purpose">Purpose</Label><Input id="entry-purpose" value={purpose} onChange={(event) => setPurpose(event.target.value)} /></div>}
        </div>
        <div className="space-y-2"><Label htmlFor="entry-notes">Notes (optional)</Label><Textarea id="entry-notes" value={notes} onChange={(event) => setNotes(event.target.value)} /></div>
        {type === 'expense' && <div className="space-y-2"><Label htmlFor="entry-receipt">Receipt (image or PDF)</Label><Input id="entry-receipt" ref={fileRef} type="file" accept="image/*,application/pdf" /></div>}
        {fieldError && <p role="alert" className="text-sm text-destructive">{fieldError}</p>}
        {warning && <div role="alert" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Balance is insufficient. This amount exceeds the remaining balance. Continue anyway?<div className="mt-3 flex gap-2"><Button type="button" size="sm" variant="outline" onClick={() => setWarning(false)}>Cancel</Button><Button type="button" size="sm" onClick={() => { setAllowOverdraft(true); setWarning(false); void submitValues() }}>Continue</Button></div></div>}
        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={mutation.isPending || updateMutation.isPending}>{mutation.isPending || updateMutation.isPending ? 'Saving...' : entry ? 'Save Changes' : 'Save Transaction'}</Button></div>
      </form>
    </FormDialog>
  )
}
