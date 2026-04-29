import type { Control } from 'react-hook-form'
import type { ProspectFormValues } from '@/lib/validations/prospect'
import { QUOTATION_OPTIONS } from '@/lib/constant'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

interface ProspectScheduleFieldsProps {
  control: Control<ProspectFormValues>
}

export function ProspectScheduleFields({
  control,
}: ProspectScheduleFieldsProps) {
  return (
    <>
      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Additional notes..."
                className="min-h-[80px] resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="meeting_schedule"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Meeting Schedule (WIB)</FormLabel>
            <FormControl>
              <Input
                type="datetime-local"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmation</FormLabel>
              <FormControl>
                <Input placeholder="Confirmation notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="quotation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quotation</FormLabel>
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {QUOTATION_OPTIONS.map((q) => (
                    <SelectItem key={q} value={q} className="capitalize">
                      {q}
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
        name="survey_schedule"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Survey Schedule</FormLabel>
            <FormControl>
              <Input
                type="datetime-local"
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
        name="result"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Result</FormLabel>
            <FormControl>
              <Input placeholder="Outcome or next steps..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
