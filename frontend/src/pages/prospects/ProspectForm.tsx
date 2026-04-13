import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import {
  prospectSchema,
  type ProspectFormValues,
} from '@/lib/validations/prospect'
import type { Prospect } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import {
  FLOOR_OPTIONS,
  NEEDS_OPTIONS,
  RENOVATION_TYPE_OPTIONS,
  QUOTATION_OPTIONS,
  PROSPECT_STATUS,
} from '@/lib/constant'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
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
import { Loader2 } from 'lucide-react'

interface ProspectFormProps {
  onSuccess?: () => void
  initialData?: Prospect | null
}

export function ProspectForm({ onSuccess, initialData }: ProspectFormProps) {
  const queryClient = useQueryClient()
  const { isSuperAdmin } = useAuth()

  const form = useForm<ProspectFormValues>({
    resolver: zodResolver(prospectSchema),
    defaultValues: {
      instagram: initialData?.instagram ?? '',
      client_name: initialData?.client_name ?? '',
      phone: initialData?.phone ?? '',
      address: initialData?.address ?? '',
      land_size: initialData?.land_size ?? undefined,
      needs: initialData?.needs ?? [],
      floor: initialData?.floor ?? '',
      renovation_type: initialData?.renovation_type ?? '',
      status: initialData?.status ?? PROSPECT_STATUS.WAITING,
      notes: initialData?.notes ?? '',
      meeting_schedule: initialData?.meeting_schedule
        ? initialData.meeting_schedule.slice(0, 16)
        : '',
      confirmation: initialData?.confirmation ?? '',
      quotation: initialData?.quotation ?? '',
      survey_schedule: initialData?.survey_schedule
        ? initialData.survey_schedule.slice(0, 16)
        : '',
      result: initialData?.result ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: ProspectFormValues) => {
      const payload = {
        ...values,
        land_size: values.land_size === '' ? null : values.land_size,
        meeting_schedule: values.meeting_schedule || null,
        survey_schedule: values.survey_schedule || null,
      }
      if (initialData) {
        return await pb.collection('prospects').update(initialData.id, payload)
      }
      return await pb.collection('prospects').create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prospects'] })
      toast.success(initialData ? 'Prospect updated.' : 'Prospect added.')
      onSuccess?.()
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to save prospect.'
      toast.error(message)
    },
  })

  function onSubmit(values: ProspectFormValues) {
    mutation.mutate(values)
  }

  const needsValue = form.watch('needs') ?? []

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Row 1: Instagram + Client Name */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <Input placeholder="@username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="client_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input placeholder="Full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 2: Phone + Address */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="0812..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="City / Area" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Row 3: Land Size + Floor */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
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
            control={form.control}
            name="floor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Floor</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                >
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

        {/* Row 4: Renovation Type + Status */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="renovation_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Renovation Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                >
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
            control={form.control}
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

        {/* Needs — multi-checkbox */}
        <FormField
          control={form.control}
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
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true
                        const current = form.getValues('needs') ?? []
                        form.setValue(
                          'needs',
                          isChecked
                            ? [...current, option]
                            : current.filter((n) => n !== option)
                        )
                      }}
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

        {/* Notes */}
        <FormField
          control={form.control}
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

        {/* Meeting Schedule — disabled for non-superadmin */}
        <FormField
          control={form.control}
          name="meeting_schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Schedule (WIB)</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                  value={field.value ?? ''}
                  disabled={!isSuperAdmin}
                  className={
                    !isSuperAdmin ? 'opacity-50 cursor-not-allowed' : ''
                  }
                />
              </FormControl>
              {!isSuperAdmin && (
                <p className="text-xs text-muted-foreground">
                  Only superadmin can set the meeting schedule.
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Row: Confirmation + Quotation */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
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
            control={form.control}
            name="quotation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quotation</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? ''}
                >
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

        {/* Survey Schedule */}
        <FormField
          control={form.control}
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

        {/* Result */}
        <FormField
          control={form.control}
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

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {initialData ? 'Save Changes' : 'Add Prospect'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
