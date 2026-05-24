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

interface CivilVendorFieldProps {
  control: Control<any>
  vendors: Vendor[]
}

export function CivilVendorField({ control, vendors }: CivilVendorFieldProps) {
  return (
    <FormField
      control={control}
      name="vendor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Field PIC</FormLabel>
          <Select onValueChange={field.onChange} value={field.value as string}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select Supervisor" />
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
