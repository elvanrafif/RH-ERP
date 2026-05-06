import type { Control, FieldValues, Path } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ClientCombobox } from './ClientCombobox'

interface ClientComboboxFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label?: string
  disabled?: boolean
  onSelect?: (clientId: string) => void
}

export function ClientComboboxField<T extends FieldValues>({
  control,
  name,
  label,
  disabled,
  onSelect,
}: ClientComboboxFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label ?? 'Client / Project Name'}</FormLabel>
          <FormControl>
            <ClientCombobox
              value={field.value}
              onChange={(clientId) => {
                field.onChange(clientId)
                onSelect?.(clientId)
              }}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
