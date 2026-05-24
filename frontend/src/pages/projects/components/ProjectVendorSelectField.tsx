import type { Control } from 'react-hook-form'
import type { Vendor } from '@/types'
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProjectVendorSelectFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  vendors: Vendor[]
  label: string
  placeholder?: string
}

export function ProjectVendorSelectField({
  control,
  vendors,
  label,
  placeholder = 'Select vendor...',
}: ProjectVendorSelectFieldProps) {
  return (
    <FormField
      control={control}
      name="vendor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} value={field.value as string}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {vendors.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  )
}
