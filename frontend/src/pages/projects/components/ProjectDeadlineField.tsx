import type { Control } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface ProjectDeadlineFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
}

export function ProjectDeadlineField({ control }: ProjectDeadlineFieldProps) {
  return (
    <FormField
      control={control}
      name="deadline"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Target Deadline</FormLabel>
          <FormControl>
            <Input
              type="date"
              {...field}
              value={field.value || ''}
              className="block w-full bg-white [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
