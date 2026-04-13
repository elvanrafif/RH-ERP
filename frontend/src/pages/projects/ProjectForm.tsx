import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { Project, Client, User } from '@/types'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
import { useVendors } from '@/hooks/useVendors'

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

  const { data: clients } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () =>
      await pb
        .collection('clients')
        .getFullList<Client>({ sort: 'company_name' }),
  })
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

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      client_id: initialData?.client || '',
      assignee:
        initialData?.assignee || (!isSuperAdmin && !isCivil ? user?.id : ''),
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
      area_scope: initialData?.meta_data?.area_scope || '',
      notes: initialData?.notes || '',
    },
  })

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
        notes: values.notes || null,
        meta_data: {
          area_scope: values.area_scope,
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
          <ClientComboboxField control={form.control} clients={clients} />

          {isCivil ? (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-center">
                  <FormLabel>Project Status</FormLabel>
                  <div className="flex items-center gap-3 h-9">
                    <FormControl>
                      <Switch
                        checked={field.value === 'finish'}
                        onCheckedChange={(checked) =>
                          field.onChange(checked ? 'finish' : 'active')
                        }
                      />
                    </FormControl>
                    <span className="text-sm text-slate-600">
                      {field.value === 'finish' ? 'Finished' : 'Still ongoing'}
                    </span>
                  </div>
                </FormItem>
              )}
            />
          ) : (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status / Stage</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value as string}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
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
          )}
        </div>

        <ProjectTypeFields
          control={form.control}
          isCivil={isCivil}
          isArchitecture={isArchitecture}
          isInterior={isInterior}
          isSuperAdmin={isSuperAdmin}
          user={user}
          users={users}
          civilVendors={resolvedCivilVendors}
          interiorVendors={resolvedInteriorVendors}
          fixedType={fixedType}
        />

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
