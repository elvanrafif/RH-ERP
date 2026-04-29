import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { surveySchema, type SurveyFormValues } from '@/lib/validations/survey'
import type { Survey, Client } from '@/types'
import { useFormMutation } from '@/hooks/useFormMutation'
import { useClients } from '@/hooks/useClients'
import { useUsers } from '@/hooks/useUsers'
import { toLocalDateTimeInput } from '@/lib/helpers'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormSubmitButton } from '@/components/shared/FormSubmitButton'
import { UserComboboxField } from '@/components/forms/UserComboboxField'
import { Check, ChevronsUpDown } from 'lucide-react'
import type { Control } from 'react-hook-form'

interface SurveyFormProps {
  onSuccess?: () => void
  initialData?: Survey | null
}

interface ClientFieldProps {
  control: Control<SurveyFormValues>
  clients: Client[] | undefined
}

function ClientField({ control, clients }: ClientFieldProps) {
  const [open, setOpen] = useState(false)

  return (
    <FormField
      control={control}
      name="client"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Client</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn('w-full justify-between', !field.value && 'text-muted-foreground')}
                >
                  {field.value
                    ? clients?.find((c) => c.id === field.value)?.company_name
                    : 'Search & Select Client...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Type client name..." />
                <CommandList>
                  <CommandEmpty>No client found.</CommandEmpty>
                  <CommandGroup>
                    {clients?.map((client) => (
                      <CommandItem
                        value={client.company_name}
                        key={client.id}
                        onSelect={() => {
                          field.onChange(client.id)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            client.id === field.value ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {client.company_name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export function SurveyForm({ onSuccess, initialData }: SurveyFormProps) {
  const { clients } = useClients()
  const { users } = useUsers()

  const { mutate, isPending } = useFormMutation<SurveyFormValues>({
    collection: 'surveys',
    queryKey: ['surveys'],
    initialData,
    onSuccess,
  })

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      client:   initialData?.client ?? '',
      surveyor: initialData?.surveyor ?? '',
      schedule: toLocalDateTimeInput(initialData?.schedule),
      notes:    initialData?.notes ?? '',
    },
  })

  function handleSubmit(values: SurveyFormValues) {
    const schedule = values.schedule
      ? new Date(values.schedule.length === 16 ? values.schedule + ':00' : values.schedule).toISOString()
      : values.schedule
    mutate({ ...values, schedule })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Client inline combobox — cannot use ClientComboboxField (hardcodes 'client_id') */}
        <ClientField control={form.control} clients={clients} />

        <UserComboboxField control={form.control} users={users} />

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

        <FormSubmitButton
          isPending={isPending}
          label={initialData ? 'Save Changes' : 'Create Survey'}
        />
      </form>
    </Form>
  )
}
