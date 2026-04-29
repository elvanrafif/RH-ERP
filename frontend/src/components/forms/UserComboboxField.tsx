import { useState } from 'react'
import type { Control, FieldValues, Path } from 'react-hook-form'
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
import type { User } from '@/types'

interface UserComboboxFieldProps<T extends FieldValues = FieldValues> {
  control: Control<T>
  users: User[] | undefined
}

export function UserComboboxField<T extends FieldValues = FieldValues>({
  control,
  users,
}: UserComboboxFieldProps<T>) {
  const [open, setOpen] = useState(false)

  return (
    <FormField
      control={control}
      name={'surveyor' as Path<T>}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Surveyor</FormLabel>
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
                    ? users?.find((u) => u.id === field.value)?.name
                    : 'Search & Select Surveyor...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Type name..." />
                <CommandList>
                  <CommandEmpty>No user found.</CommandEmpty>
                  <CommandGroup>
                    {users?.map((user) => (
                      <CommandItem
                        value={user.name}
                        key={user.id}
                        onSelect={() => {
                          field.onChange(user.id)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            user.id === field.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {user.name}
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
