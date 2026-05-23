import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface HoldProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
  isPending: boolean
}

export function HoldProjectDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: HoldProjectDialogProps) {
  const [reason, setReason] = useState('')

  const handleConfirm = () => {
    onConfirm(reason)
    setReason('')
  }

  const handleOpenChange = (next: boolean) => {
    if (!isPending) {
      setReason('')
      onOpenChange(next)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Hold Project</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Project will be marked On Hold and excluded from deadline alerts.
        </p>
        <div className="space-y-2">
          <Label htmlFor="hold-reason">
            Reason{' '}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Textarea
            id="hold-reason"
            rows={3}
            placeholder="e.g. Client requested a pause pending family decision..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Hold
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
