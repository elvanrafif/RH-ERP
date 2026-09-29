import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { FormDialog } from '@/components/shared/FormDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdatePettyCashName } from '@/hooks/usePettyCash'
import { updatePettyCashNameSchema } from '@/lib/validations/pettyCash'
import type { PettyCash } from '@/types/pettyCash'

interface EditPettyCashNameDialogProps {
  period: PettyCash
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditPettyCashNameDialog({ period, open, onOpenChange }: EditPettyCashNameDialogProps) {
  const mutation = useUpdatePettyCashName()
  const form = useForm({
    resolver: zodResolver(updatePettyCashNameSchema),
    defaultValues: { name: period.name },
  })

  useEffect(() => {
    if (open) form.reset({ name: period.name })
  }, [form, open, period.name])

  const submit = form.handleSubmit(async ({ name }) => {
    try {
      await mutation.mutateAsync({ id: period.id, name })
      toast.success('Petty cash name updated')
      onOpenChange(false)
    } catch {
      toast.error('Failed to update petty cash name')
    }
  })

  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Edit Petty Cash Name" description="Update the name shown for this petty cash period.">
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-petty-cash-name">Name</Label>
          <Input id="edit-petty-cash-name" {...form.register('name')} />
          {form.formState.errors.name && <p role="alert" className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </form>
    </FormDialog>
  )
}
