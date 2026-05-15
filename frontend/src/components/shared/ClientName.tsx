import { formatClientName } from '@/lib/helpers'

interface ClientNameProps {
  name: string
  salutation?: string
  className?: string
}

export function ClientName({ name, salutation, className }: ClientNameProps) {
  return (
    <span className={className}>
      {salutation && (
        <span className="text-muted-foreground font-normal text-xs mr-1">
          {salutation}
        </span>
      )}
      {name}
    </span>
  )
}

export { formatClientName }
