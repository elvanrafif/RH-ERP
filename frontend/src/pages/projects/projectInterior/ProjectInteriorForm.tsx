import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Project } from '@/types'
import { PROJECT_TYPE_TO_DIVISION } from '@/lib/constant'
import { useRole } from '@/hooks/useRole'
import { useUsers } from '@/hooks/useUsers'
import { useVendors } from '@/hooks/useVendors'
import { useLinkedInvoices } from '@/hooks/useInvoices'
import { useProjectMutation } from '@/hooks/useProjects'
import { projectSchema } from '@/lib/validations/project'
import type { ProjectFormValues } from '@/lib/validations/project'
import { ClientComboboxField } from '@/components/forms/ClientComboboxField'
import { AdditionalLinksField } from '@/components/forms/AdditionalLinksField'
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

const STATUS_OPTIONS = [
  { value: 'draft_skematik', label: 'Schematic Draft' },
  { value: 'detail_drawing', label: 'Detail Drawing' },
  { value: 'finish', label: 'Finish' },
]

interface ProjectInteriorFormProps {
  onSuccess?: () => void
  initialData?: Project | null
}

export function ProjectInteriorForm({
  onSuccess,
  initialData,
}: ProjectInteriorFormProps) {
  const { isSuperAdmin, user } = useRole()
  const { users } = useUsers()

  const assignedVendorId = initialData?.vendor
  const assignedVendor = initialData?.expand?.vendor
  const { vendors: interiorVendors } = useVendors({
    projectType: 'interior',
    activeOnly: true,
  })
  const resolvedInteriorVendors =
    assignedVendorId &&
    assignedVendor &&
    !interiorVendors.find((v) => v.id === assignedVendorId)
      ? [...interiorVendors, assignedVendor]
      : interiorVendors

  const availableUsers =
    users?.filter(
      (u) =>
        u.division?.toLowerCase() === PROJECT_TYPE_TO_DIVISION['interior']
    ) ?? []
  if (!isSuperAdmin && user && !availableUsers.find((u) => u.id === user.id)) {
    availableUsers.push(user)
  }

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      client_id: initialData?.client || '',
      assignee: initialData?.assignee || (!isSuperAdmin ? user?.id : '') || '',
      status: initialData?.status || STATUS_OPTIONS[0].value,
      deadline: initialData?.deadline
        ? initialData.deadline.substring(0, 10)
        : '',
      vendor: initialData?.vendor || '',
      area_scope: initialData?.meta_data?.area_scope || '',
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

  const { linkedInvoices } = useLinkedInvoices('interior', clientId, isSuperAdmin && !!clientId)
  const { mutate, isPending } = useProjectMutation(initialData, onSuccess)

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          mutate({
            client: data.client_id,
            assignee: data.assignee || null,
            status: data.status,
            type: 'interior',
            deadline: data.deadline || null,
            vendor: data.vendor || null,
            notes: data.notes || null,
            invoice_id: data.invoice_id === '__none__' ? null : data.invoice_id || null,
            meta_data: {
              area_scope: data.area_scope || '',
              additional_links:
                data.additional_links
                  ?.filter((l) => l.url.trim())
                  .map((l) => ({ label: l.label?.trim() ?? '', url: l.url.trim() })) || [],
            },
          })
        )}
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

        {/* Area / Scope */}
        <FormField
          control={form.control}
          name="area_scope"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area / Scope (e.g. Kitchen Set & Master Bed)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Type work scope..."
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Interior PIC + Vendor */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="assignee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interior PIC</FormLabel>
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
            name="vendor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interior Vendor / Contractor</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value as string}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {resolvedInteriorVendors.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        {/* Deadline */}
        <div className="grid grid-cols-2 gap-4">
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
          <Button type="submit" disabled={isPending}>
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Project
          </Button>
        </div>
      </form>
    </Form>
  )
}
