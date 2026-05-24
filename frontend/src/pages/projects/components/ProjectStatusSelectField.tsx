import type { Control } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface StatusOption {
  value: string
  label: string
}

interface ProjectStatusSelectFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  options: StatusOption[]
  label?: string
}

export function ProjectStatusSelectField({
  control,
  options,
  label = 'Status / Stage',
}: ProjectStatusSelectFieldProps) {
  return (
    <FormField
      control={control}
      name="status"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value as string}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  )
}
