import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { surveySchema, type SurveyFormValues } from '@/lib/validations/survey'
import type { Survey, Client, User } from '@/types'
import { useFormMutation } from '@/hooks/useFormMutation'
import { toLocalDateTimeInput } from '@/lib/helpers'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ClientComboboxField } from '@/components/forms/ClientComboboxField'
import { UserComboboxField } from '@/components/forms/UserComboboxField'
import { Loader2 } from 'lucide-react'
import { SURVEY_STATUS } from '@/lib/constant'

interface SurveyFormProps {
  onSuccess?: () => void
  initialData?: Survey | null
  clients: Client[]
  users: User[]
}

export function SurveyForm({
  onSuccess,
  initialData,
  clients,
  users,
}: SurveyFormProps) {
  const { mutate, isPending } = useFormMutation<SurveyFormValues>({
    collection: 'surveys',
    queryKey: ['surveys'],
    initialData,
    onSuccess,
  })

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      client: initialData?.client ?? '',
      surveyor: initialData?.surveyor ?? '',
      schedule: toLocalDateTimeInput(initialData?.schedule),
      status: initialData?.status ?? SURVEY_STATUS.PENDING,
      notes: initialData?.notes ?? '',
    },
  })

  function handleSubmit(values: SurveyFormValues) {
    const schedule = values.schedule
      ? new Date(
          values.schedule.length === 16
            ? values.schedule + ':00'
            : values.schedule
        ).toISOString()
      : values.schedule
    mutate({ ...values, schedule })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <ClientComboboxField
          control={form.control}
          name="client"
          label="Client"
          clients={clients}
        />

        <UserComboboxField
          control={form.control}
          name="surveyor"
          label="Surveyor"
          users={users}
        />

        <FormField
          control={form.control}
          name="schedule"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schedule</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
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
                  <SelectItem value={SURVEY_STATUS.PENDING}>Pending</SelectItem>
                  <SelectItem value={SURVEY_STATUS.DONE}>Done</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any notes about this survey..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Save Changes' : 'Create Survey'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
