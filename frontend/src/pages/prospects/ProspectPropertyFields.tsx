import type { Control } from 'react-hook-form'
import type { ProspectFormValues } from '@/lib/validations/prospect'
import {
  FLOOR_OPTIONS,
  NEEDS_OPTIONS,
  RENOVATION_TYPE_OPTIONS,
  PROSPECT_STATUS,
} from '@/lib/constant'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ProspectPropertyFieldsProps {
  control: Control<ProspectFormValues>
  needsValue: string[]
  onNeedsToggle: (option: string, checked: boolean) => void
}

export function ProspectPropertyFields({
  control,
  needsValue,
  onNeedsToggle,
}: ProspectPropertyFieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="land_size"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Land Size (m²)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="e.g. 120"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="floor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Floor</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select floor..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FLOOR_OPTIONS.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f} Lantai
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="renovation_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Renovation Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {RENOVATION_TYPE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(PROSPECT_STATUS).map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="needs"
        render={() => (
          <FormItem>
            <FormLabel>Needs</FormLabel>
            <div className="flex gap-6 mt-1">
              {NEEDS_OPTIONS.map((option) => (
                <div key={option} className="flex items-center gap-2">
                  <Checkbox
                    id={`needs-${option}`}
                    checked={needsValue.includes(option)}
                    onCheckedChange={(checked) =>
                      onNeedsToggle(option, checked === true)
                    }
                  />
                  <label
                    htmlFor={`needs-${option}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option}
                  </label>
                </div>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
