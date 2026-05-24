import type { Control } from 'react-hook-form'
import { NumberInput } from '@/components/shared/NumberInput'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'

interface AreaFieldsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
}

export function AreaFields({ control }: AreaFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name="luas_tanah"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Land Area (m²)</FormLabel>
            <FormControl>
              <NumberInput
                value={field.value ?? 0}
                onChange={field.onChange}
                step={0.5}
                min={0}
                decimal
                placeholder="0"
              />
            </FormControl>
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="luas_bangunan"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Building Area (m²)</FormLabel>
            <FormControl>
              <NumberInput
                value={field.value ?? 0}
                onChange={field.onChange}
                step={0.5}
                min={0}
                decimal
                placeholder="0"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  )
}
