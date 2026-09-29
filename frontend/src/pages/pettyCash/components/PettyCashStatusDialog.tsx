import { useState } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useUpdatePettyCashStatus } from '@/hooks/usePettyCash'
import type { PettyCash } from '@/types/pettyCash'

interface PettyCashStatusDialogProps {
  period: PettyCash
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PettyCashStatusDialog({ period, open, onOpenChange }: PettyCashStatusDialogProps) {
  const [error, setError] = useState('')
  const mutation = useUpdatePettyCashStatus()
  const nextStatus = period.status === 'open' ? 'closed' : 'open'
  const isClosing = nextStatus === 'closed'

  const confirm = async () => {
    setError('')
    try {
      await mutation.mutateAsync({ id: period.id, status: nextStatus })
      toast.success(isClosing ? 'Petty cash closed' : 'Petty cash reopened')
      onOpenChange(false)
    } catch {
      setError('Failed to update status. Please try again.')
      toast.error('Failed to update petty cash status')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isClosing ? 'Close Petty Cash' : 'Reopen Petty Cash'}</DialogTitle>
          <DialogDescription>{isClosing ? 'Transactions cannot be changed while this petty cash is closed.' : 'Transactions can be changed again after reopening.'}</DialogDescription>
        </DialogHeader>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{isClosing ? 'Are you sure you want to close this petty cash? Transactions cannot be changed while it is closed.' : 'Reopen this petty cash? Transactions can be changed again after reopening.'}</p>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button variant={isClosing ? 'destructive' : 'default'} disabled={mutation.isPending} onClick={() => void confirm()}>{mutation.isPending ? 'Saving...' : isClosing ? 'Close Petty Cash' : 'Reopen Petty Cash'}</Button></div>
      </div>
      </DialogContent>
    </Dialog>
  )
}
