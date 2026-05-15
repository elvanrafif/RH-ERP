import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronDown, Loader2, X } from 'lucide-react'
import { useClientSearch } from '@/hooks/useClientSearch'
import type { Client } from '@/types'
import { formatClientName } from '@/components/shared/ClientName'

interface ClientComboboxProps {
  value: string
  onChange: (clientId: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Show "All Clients" as the first option — for filter use cases */
  showAllOption?: boolean
  /** Fires with the full client object when a client is selected — useful when caller needs more than just the ID */
  onClientSelect?: (client: Client) => void
  /** Show X button to clear selection (default true). Set false when client should always be set, e.g. document editors */
  clearable?: boolean
  /** Extra classes for the PopoverContent — use to override width when trigger is narrow */
  popoverClassName?: string
}

export function ClientCombobox({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  showAllOption = false,
  onClientSelect,
  clearable = true,
  popoverClassName,
}: ClientComboboxProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedName, setSelectedName] = useState<string | null>(null)

  const { clients, isLoading, isRecent } = useClientSearch(searchQuery)

  // Fetch name when value is pre-set (edit mode) but name is not yet known
  const needsNameFetch = !!value && value !== 'all' && selectedName === null
  const { data: preselectedClient } = useQuery({
    queryKey: ['client', value],
    queryFn: () => pb.collection('clients').getOne<Client>(value),
    enabled: needsNameFetch,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!value || value === 'all') setSelectedName(null)
  }, [value])

  const displayName =
    selectedName ??
    (preselectedClient ? formatClientName(preselectedClient) : null)

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) setSearchQuery('')
  }

  const handleSelect = (clientId: string, name: string, client?: Client) => {
    onChange(clientId)
    setSelectedName(clientId === 'all' ? null : name)
    if (client) onClientSelect?.(client)
    handleOpenChange(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    setSelectedName(null)
  }

  const effectivePlaceholder =
    placeholder ?? (showAllOption ? 'All Clients' : 'Search & Select Client...')

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between font-normal',
            !displayName && !showAllOption && 'text-muted-foreground',
            className
          )}
        >
          {displayName ?? effectivePlaceholder}
          <span className="ml-2 flex items-center gap-1">
            {clearable && !showAllOption && displayName && (
              <X
                className="h-3.5 w-3.5 shrink-0 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )}
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'w-[var(--radix-popover-trigger-width)] p-0',
          popoverClassName
        )}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type to search clients..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : (
              <CommandGroup heading={isRecent ? 'Recent Clients' : undefined}>
                {showAllOption && (
                  <CommandItem
                    value="all__all"
                    onSelect={() => handleSelect('all', '')}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === 'all' ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    All Clients
                  </CommandItem>
                )}
                {clients?.map((client) => {
                  const displayLabel = formatClientName(client)
                  return (
                    <CommandItem
                      value={`${client.id}__${displayLabel}`}
                      key={client.id}
                      onSelect={() =>
                        handleSelect(client.id, displayLabel, client)
                      }
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          client.id === value ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {displayLabel}
                    </CommandItem>
                  )
                })}
                {!isLoading && clients?.length === 0 && !showAllOption && (
                  <CommandEmpty>No client found.</CommandEmpty>
                )}
              </CommandGroup>
            )}
            {isRecent && !isLoading && (
              <p className="px-3 py-2 text-xs text-muted-foreground border-t">
                Type 2+ characters to search all clients
              </p>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
