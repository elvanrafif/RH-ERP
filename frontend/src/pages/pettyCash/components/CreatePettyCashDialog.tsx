import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { FormDialog } from '@/components/shared/FormDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PETTY_CASH_DEFAULT_BALANCE } from '@/lib/constant'
import { createPettyCashSchema } from '@/lib/validations/pettyCash'
import { useCreatePettyCash } from '@/hooks/usePettyCash'
import { useNavigate } from 'react-router-dom'
import { formatAmountInput, parseAmountInput } from '@/lib/pettyCash/money'
import { useState } from 'react'

interface CreatePettyCashDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getTodayName() {
  const today = new Date()
  return `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`
}

export function CreatePettyCashDialog({
  open,
  onOpenChange,
}: CreatePettyCashDialogProps) {
  const navigate = useNavigate()
  const mutation = useCreatePettyCash()
  const [balanceInput, setBalanceInput] = useState(formatAmountInput(String(PETTY_CASH_DEFAULT_BALANCE)))
  const form = useForm({
    resolver: zodResolver(createPettyCashSchema),
    defaultValues: { name: getTodayName(), initial_balance: PETTY_CASH_DEFAULT_BALANCE },
  })

  const submit = form.handleSubmit(async (values) => {
    try {
      const record = await mutation.mutateAsync({ ...values, initial_balance: parseAmountInput(balanceInput) })
      toast.success('Petty cash created')
      onOpenChange(false)
      navigate(`/petty-cash/${record.id}`)
    } catch {
      toast.error('Failed to create petty cash')
    }
  })

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Create Petty Cash" description="Set a name and the opening balance for this petty cash period.">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="petty-cash-name">Name</Label>
          <Input id="petty-cash-name" {...form.register('name')} />
          {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="petty-cash-balance">Initial Balance</Label>
          <Input id="petty-cash-balance" type="text" inputMode="numeric" value={balanceInput} onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, '')
            setBalanceInput(formatAmountInput(digits))
            form.setValue('initial_balance', parseAmountInput(digits), { shouldValidate: true })
          }} />
          {form.formState.errors.initial_balance && <p className="text-sm text-destructive">{form.formState.errors.initial_balance.message}</p>}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Creating...' : 'Create Petty Cash'}</Button>
        </div>
      </form>
    </FormDialog>
  )
}
