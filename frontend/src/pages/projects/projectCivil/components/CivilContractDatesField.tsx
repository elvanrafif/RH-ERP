import type { Control } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface CivilContractDatesFieldProps {
  control: Control<any>
}

export function CivilContractDatesField({ control }: CivilContractDatesFieldProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name="start_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contract Start</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                value={field.value || ''}
                className="block w-full bg-white [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="end_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Contract End</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                value={field.value || ''}
                className="block w-full bg-white [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}
