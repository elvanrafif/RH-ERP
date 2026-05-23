import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Project, User } from '@/types'
import { PROJECT_TYPE_TO_DIVISION } from '@/lib/constant'
import { MaskingTextByArchitectureStatus } from '@/lib/masking'
import { toast } from 'sonner'
import { useRole } from '@/hooks/useRole'
import { projectSchema } from '@/lib/validations/project'
import type { ProjectFormValues } from '@/lib/validations/project'
import { ClientComboboxField } from '@/components/forms/ClientComboboxField'
import { AdditionalLinksField } from '@/components/forms/AdditionalLinksField'
import { NumberInput } from '@/components/shared/NumberInput'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

const STATUS_OPTIONS = ['denah', 'fasad', 'detail_drawing', 'finish'].map(
  (value) => ({ value, label: MaskingTextByArchitectureStatus(value) })
)

interface ProjectArchitectureFormProps {
  onSuccess?: () => void
  initialData?: Project | null
}

export function ProjectArchitectureForm({
  onSuccess,
  initialData,
}: ProjectArchitectureFormProps) {
  const queryClient = useQueryClient()
  const { isSuperAdmin, user } = useRole()

  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => await pb.collection('users').getFullList<User>(),
  })

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      client_id: initialData?.client || '',
      assignee: initialData?.assignee || (!isSuperAdmin ? user?.id : '') || '',
      status: initialData?.status || STATUS_OPTIONS[0].value,
      deadline: initialData?.deadline
        ? initialData.deadline.substring(0, 10)
        : '',
      luas_tanah: initialData?.luas_tanah || 0,
      luas_bangunan: initialData?.luas_bangunan || 0,
      notes: initialData?.notes || '',
      invoice_id: initialData?.invoice_id || '__none__',
      additional_links: initialData?.meta_data?.additional_links?.length
        ? (
            initialData.meta_data.additional_links as Array<
              string | { label?: string; url: string }
            >
          ).map((v) =>
            typeof v === 'string'
              ? { label: '', url: v }
              : { label: v.label ?? '', url: v.url ?? '' }
          )
        : [{ label: '', url: '' }],
    },
  })

  const clientId = form.watch('client_id')

  const { data: linkedInvoices = [] } = useQuery({
    queryKey: ['invoices-for-project', 'design', clientId],
    queryFn: () =>
      pb.collection('invoices').getFullList({
        filter: `type = "design" && client_id = "${clientId}"`,
        expand: 'client_id',
        fields: 'id,invoice_number,expand.client_id.company_name',
        sort: '-created',
      }),
    enabled: isSuperAdmin && !!clientId,
  })

  const availableUsers =
    users?.filter(
      (u) =>
        u.division?.toLowerCase() === PROJECT_TYPE_TO_DIVISION['architecture']
    ) ?? []
  if (!isSuperAdmin && user && !availableUsers.find((u) => u.id === user.id)) {
    availableUsers.push(user)
  }

  const mutation = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const payload = {
        client: values.client_id,
        assignee: values.assignee || null,
        status: values.status,
        type: 'architecture' as const,
        deadline: values.deadline || null,
        luas_tanah: values.luas_tanah || null,
        luas_bangunan: values.luas_bangunan || null,
        notes: values.notes || null,
        invoice_id:
          values.invoice_id === '__none__' ? null : values.invoice_id || null,
        meta_data: {
          additional_links:
            values.additional_links
              ?.filter((l) => l.url.trim())
              .map((l) => ({
                label: l.label?.trim() ?? '',
                url: l.url.trim(),
              })) || [],
        },
      }
      return initialData
        ? await pb.collection('projects').update(initialData.id, payload)
        : await pb.collection('projects').create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success(
        initialData ? 'Project updated successfully' : 'Project created successfully'
      )
      onSuccess?.()
    },
    onError: (err) => {
      console.error(err)
      toast.error('Failed to save project')
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ClientComboboxField control={form.control} name="client_id" />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Status / Stage</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value as string}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
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
            control={form.control}
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="assignee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PIC Design / Drafter</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value as string}
                  disabled={!isSuperAdmin}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select PIC" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isSuperAdmin && (
                      <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                    )}
                    {availableUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name || u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="deadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Deadline</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={field.value || ''}
                    className="block w-full bg-white [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <AdditionalLinksField control={form.control} />

        {isSuperAdmin && (
          <FormField
            control={form.control}
            name="invoice_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Linked Invoice</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={(field.value as string) || '__none__'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select invoice (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {linkedInvoices.map((inv) => {
                      const clientName =
                        inv.expand?.client_id?.company_name ?? '—'
                      return (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.invoice_number} — {clientName}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
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

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Project
          </Button>
        </div>
      </form>
    </Form>
  )
}
