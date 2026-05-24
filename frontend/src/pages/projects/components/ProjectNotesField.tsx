import type { Control } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'

interface ProjectNotesFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
}

export function ProjectNotesField({ control }: ProjectNotesFieldProps) {
  return (
    <FormField
      control={control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Notes</FormLabel>
          <FormControl>
            <Textarea rows={4} {...field} value={field.value || ''} />
          </FormControl>
        </FormItem>
      )}
    />
  )
}
