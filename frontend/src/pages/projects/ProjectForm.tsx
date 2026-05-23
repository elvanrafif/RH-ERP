import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Project, User } from '@/types'
import { DIVISION } from '@/lib/constant'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
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
import { TypeProjectsBoolean } from '@/lib/booleans'
import { useRole } from '@/hooks/useRole'
import { projectSchema } from '@/lib/validations/project'
import type { ProjectFormValues } from '@/lib/validations/project'
import { ClientComboboxField } from '@/components/forms/ClientComboboxField'
import { ProjectTypeFields } from './components/ProjectTypeFields'
import { AdditionalLinksField } from './components/AdditionalLinksField'
import { useVendors } from '@/hooks/useVendors'
import { useProjectArchitectureByClient } from '@/hooks/useProjectArchitectureByClient'

interface ProjectFormProps {
  onSuccess?: () => void
  initialData?: Project | null
  fixedType: 'architecture' | 'civil' | 'interior'
  statusOptions: { value: string; label: string }[]
}

export function ProjectForm({
  onSuccess,
  initialData,
  fixedType,
  statusOptions,
}: ProjectFormProps) {
  const queryClient = useQueryClient()
  const { isSuperAdmin, user } = useRole()
  const { isArchitecture, isCivil, isInterior } = TypeProjectsBoolean(fixedType)

  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => await pb.collection('users').getFullList<User>(),
  })

  const { vendors: civilVendors } = useVendors(
    isCivil ? { projectType: 'civil', activeOnly: true } : {}
  )
  const { vendors: interiorVendors } = useVendors(
    isInterior ? { projectType: 'interior', activeOnly: true } : {}
  )

  const invoiceTypeMap: Record<string, string> = {
    architecture: 'design',
    civil: 'sipil',
    interior: 'interior',
  }
  const invoiceType = invoiceTypeMap[fixedType]

  const { data: linkedInvoices = [] } = useQuery({
    queryKey: ['invoices-for-project', invoiceType],
    queryFn: () =>
      pb.collection('invoices').getFullList({
        filter: `type = "${invoiceType}"`,
        expand: 'client_id',
        fields: 'id,invoice_number,expand.client_id.company_name',
        sort: '-created',
      }),
    enabled: isSuperAdmin,
  })

  // Saat edit, pastikan vendor yang sudah tersimpan tetap muncul walau tidak aktif
  const assignedVendorId = initialData?.vendor
  const assignedVendor = initialData?.expand?.vendor

  const resolvedCivilVendors =
    isCivil &&
    assignedVendorId &&
    assignedVendor &&
    !civilVendors.find((v) => v.id === assignedVendorId)
      ? [...civilVendors, assignedVendor]
      : civilVendors

  const resolvedInteriorVendors =
    isInterior &&
    assignedVendorId &&
    assignedVendor &&
    !interiorVendors.find((v) => v.id === assignedVendorId)
      ? [...interiorVendors, assignedVendor]
      : interiorVendors

  const civilUsers = users?.filter(
    (u) => u.division?.toLowerCase() === DIVISION.CIVIL
  )

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      client_id: initialData?.client || '',
      assignee: initialData?.assignee || (!isSuperAdmin ? user?.id : '') || '',
      status: initialData?.status || statusOptions[0]?.value || '',
      contract_value: initialData?.contract_value || 0,
      deadline: initialData?.deadline
        ? initialData.deadline.substring(0, 10)
        : '',
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
      area_scope: initialData?.meta_data?.area_scope || '',
      notes: initialData?.notes || '',
      invoice_id: initialData?.invoice_id || '',
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
  const { architectureProjects } = useProjectArchitectureByClient(
    isCivil ? clientId : undefined
  )
  useEffect(() => {
    if (prevClientRef.current !== clientId) {
      prevClientRef.current = clientId
      if (isCivil) form.setValue('source_architecture', '__none__')
    }
  }, [clientId])

  useEffect(() => {
    if (isCivil && isSuperAdmin && !initialData && civilUsers?.length) {
      if (!form.getValues('assignee')) {
        form.setValue('assignee', civilUsers[0].id)
      }
    }
  }, [civilUsers?.length])

  const mutation = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const payload = {
        client: values.client_id,
        assignee: values.assignee || null,
        status: values.status,
        type: fixedType,
        contract_value: values.contract_value,
        deadline: values.deadline || null,
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
        invoice_id: values.invoice_id || null,
        meta_data: {
          area_scope: values.area_scope,
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
        initialData
          ? 'Project updated successfully'
          : 'Project created successfully'
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
                <FormLabel>
                  {isCivil ? 'Project Status' : 'Status / Stage'}
                </FormLabel>
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
                    {statusOptions.map((opt) => (
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

        <ProjectTypeFields
          control={form.control}
          isCivil={isCivil}
          isArchitecture={isArchitecture}
          isInterior={isInterior}
          isSuperAdmin={isSuperAdmin}
          user={user}
          users={users}
          civilUsers={civilUsers}
          civilVendors={resolvedCivilVendors}
          interiorVendors={resolvedInteriorVendors}
          fixedType={fixedType}
          architectureProjects={architectureProjects}
        />

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
                  value={(field.value as string) || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select invoice (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
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
