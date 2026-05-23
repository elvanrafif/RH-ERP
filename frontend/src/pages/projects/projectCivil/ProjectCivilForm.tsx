import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Project, User } from '@/types'
import { DIVISION } from '@/lib/constant'
import { MaskingTextByArchitectureStatus } from '@/lib/masking'
import { toast } from 'sonner'
import { useRole } from '@/hooks/useRole'
import { useVendors } from '@/hooks/useVendors'
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
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useProjectArchitectureByClient } from '../projectArchitecture/hooks/useProjectArchitectureByClient'

const STATUS_OPTIONS = [
  { value: 'building', label: 'Building' },
  { value: 'finishing', label: 'Finishing' },
  { value: 'finish', label: 'Finished' },
]

interface ProjectCivilFormProps {
  onSuccess?: () => void
  initialData?: Project | null
}

export function ProjectCivilForm({
  onSuccess,
  initialData,
}: ProjectCivilFormProps) {
  const queryClient = useQueryClient()
  const { isSuperAdmin } = useRole()

  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => await pb.collection('users').getFullList<User>(),
  })

  const civilUsers = users?.filter(
    (u) => u.division?.toLowerCase() === DIVISION.CIVIL
  )

  const assignedVendorId = initialData?.vendor
  const assignedVendor = initialData?.expand?.vendor
  const { vendors: civilVendors } = useVendors({ projectType: 'civil', activeOnly: true })
  const resolvedCivilVendors =
    assignedVendorId &&
    assignedVendor &&
    !civilVendors.find((v) => v.id === assignedVendorId)
      ? [...civilVendors, assignedVendor]
      : civilVendors

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      client_id: initialData?.client || '',
      assignee: initialData?.assignee || '',
      status: initialData?.status || STATUS_OPTIONS[0].value,
      start_date: initialData?.start_date
        ? initialData.start_date.substring(0, 10)
        : '',
      end_date: initialData?.end_date
        ? initialData.end_date.substring(0, 10)
        : '',
      luas_tanah: initialData?.luas_tanah || 0,
      luas_bangunan: initialData?.luas_bangunan || 0,
      vendor: initialData?.vendor || '',
      source_architecture: initialData?.source_architecture || '__none__',
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
  const prevClientRef = useRef(clientId)

  const { architectureProjects } = useProjectArchitectureByClient(clientId)

  useEffect(() => {
    if (prevClientRef.current !== clientId) {
      prevClientRef.current = clientId
      form.setValue('source_architecture', '__none__')
    }
  }, [clientId])

  useEffect(() => {
    if (isSuperAdmin && !initialData && civilUsers?.length) {
      if (!form.getValues('assignee')) {
        form.setValue('assignee', civilUsers[0].id)
      }
    }
  }, [civilUsers?.length])

  const { data: linkedInvoices = [] } = useQuery({
    queryKey: ['invoices-for-project', 'sipil', clientId],
    queryFn: () =>
      pb.collection('invoices').getFullList({
        filter: `type = "sipil" && client_id = "${clientId}"`,
        expand: 'client_id',
        fields: 'id,invoice_number,expand.client_id.company_name',
        sort: '-created',
      }),
    enabled: isSuperAdmin && !!clientId,
  })

  const mutation = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const payload = {
        client: values.client_id,
        assignee: values.assignee || null,
        status: values.status,
        type: 'civil' as const,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        luas_tanah: values.luas_tanah || null,
        luas_bangunan: values.luas_bangunan || null,
        vendor: values.vendor || null,
        source_architecture:
          values.source_architecture === '__none__'
            ? null
            : values.source_architecture || null,
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
                <FormLabel>Project Status</FormLabel>
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

        {/* Contract dates */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract Start</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={field.value || ''}
                    className="block w-full bg-white [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contract End</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={field.value || ''}
                    className="block w-full bg-white [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Land + Building area */}
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

        {/* Source architecture */}
        <FormField
          control={form.control}
          name="source_architecture"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Converted from Architecture Project</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={(field.value as string) || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="None (fresh project)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="__none__">None (fresh project)</SelectItem>
                  {architectureProjects.map((ap) => (
                    <SelectItem key={ap.id} value={ap.id}>
                      {users?.find((u) => u.id === ap.assignee)?.name ?? '—'} ·{' '}
                      {MaskingTextByArchitectureStatus(ap.status)}
                      {(ap.luas_tanah || ap.luas_bangunan) && (
                        <span className="text-muted-foreground">
                          {' '}
                          · L:{ap.luas_tanah ?? 0}m² | B:{ap.luas_bangunan ?? 0}m²
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {/* Managed By + Field PIC */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="assignee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Managed By</FormLabel>
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
                    {civilUsers?.map((u) => (
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
                <FormLabel>Field PIC</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value as string}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Supervisor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {resolvedCivilVendors.map((v) => (
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
