import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormSubmitButtonProps {
  isPending: boolean
  label: string
  className?: string
}

export function FormSubmitButton({ isPending, label, className }: FormSubmitButtonProps) {
  return (
    <div className={cn('flex justify-end pt-4', className)}>
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {label}
      </Button>
    </div>
  )
}
