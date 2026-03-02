import { useState } from 'react'
import type { Control, FieldValues } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
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
import { Check, ChevronsUpDown } from 'lucide-react'
import type { Client } from '@/types'

interface ClientComboboxFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>
  clients: Client[] | undefined
  onSelect?: (clientId: string) => void
}

export function ClientComboboxField<T extends FieldValues = FieldValues>({
  control,
  clients,
  onSelect,
}: ClientComboboxFieldProps<T>) {
  const [open, setOpen] = useState(false)

  return (
    <FormField
      control={control}
      name="client_id"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Client / Project Name</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className={cn(
                    'w-full justify-between',
                    !field.value && 'text-muted-foreground'
                  )}
                >
                  {field.value
                    ? clients?.find((c) => c.id === field.value)?.company_name
                    : 'Search & Select Client...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Type client name..." />
                <CommandList>
                  <CommandEmpty>No client found.</CommandEmpty>
                  <CommandGroup>
                    {clients?.map((client) => (
                      <CommandItem
                        value={client.company_name}
                        key={client.id}
                        onSelect={() => {
                          field.onChange(client.id)
                          onSelect?.(client.id)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            client.id === field.value
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {client.company_name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
