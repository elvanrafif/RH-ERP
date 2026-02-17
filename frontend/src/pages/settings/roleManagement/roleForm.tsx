import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2 } from 'lucide-react'

// --- PERMISSIONS DICTIONARY ---
const PERMISSION_GROUPS = [
  {
    title: 'Dashboard & Finance',
    permissions: [
      { id: 'view_dashboard', label: 'View Main Dashboard' },
      { id: 'view_revenue', label: 'View Revenue & Financials' },
    ],
  },
  {
    title: 'Architecture Projects',
    permissions: [
      {
        id: 'view_index_project_architecture',
        label: 'View Architecture Projects',
      },
      {
        id: 'view_detail_project_architecture',
        label: 'View Architecture Details Project',
      },
      {
        id: 'manage_architecture',
        label: 'Create/Edit/Delete Architecture',
      },
    ],
  },
  {
    title: 'Civil Projects',
    permissions: [
      {
        id: 'view_index_project_civil',
        label: 'View Civil Projects',
      },
      {
        id: 'view_detail_project_civil',
        label: 'View Civil Details Project',
      },
      {
        id: 'manage_civil',
        label: 'Create/Edit/Delete Civil',
      },
    ],
  },
  {
    title: 'Interior Projects',
    permissions: [
      {
        id: 'view_index_project_interior',
        label: 'View Interior Projects',
      },
      {
        id: 'view_detail_project_interior',
        label: 'View Interior Details Project',
      },
      {
        id: 'manage_interior',
        label: 'Create/Edit/Delete Interior',
      },
    ],
  },
  {
    title: 'Master Data & Settings',
    permissions: [
      { id: 'view_clients', label: 'View Client Database' },
      { id: 'manage_clients', label: 'Manage Clients' },
      { id: 'manage_users', label: 'Manage Users & Roles (Superadmin)' },
    ],
  },
]

// --- SCHEMA FORM ---
const roleFormSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  permissions: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: 'You have to select at least one permission.',
    }),
})

type RoleFormValues = z.infer<typeof roleFormSchema>

interface RoleFormProps {
  initialData?: any
  onSuccess: () => void
}

export function RoleForm({ initialData, onSuccess }: RoleFormProps) {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      permissions: initialData?.permissions || [],
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: RoleFormValues) => {
      if (initialData) {
        return await pb.collection('roles').update(initialData.id, values)
      } else {
        return await pb.collection('roles').create(values)
      }
    },
    onSuccess: () => {
      toast.success(
        initialData ? 'Role updated successfully' : 'Role created successfully'
      )
      onSuccess()
    },
    onError: (err) => {
      console.error(err)
      toast.error('Failed to save role')
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-6 pt-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold">
                Role Name
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. Architecture Drafter" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">Access Permissions</h3>
            <p className="text-sm text-muted-foreground">
              Select the access rights for this role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.title} className="space-y-3">
                <h4 className="font-bold text-sm text-slate-800 border-b pb-1">
                  {group.title}
                </h4>
                {group.permissions.map((perm) => (
                  <FormField
                    key={perm.id}
                    control={form.control}
                    name="permissions"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={perm.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(perm.id) || false} // <-- Tambahkan || false di sini
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || [] // <-- Pastikan selalu array
                                return checked
                                  ? field.onChange([...currentValue, perm.id])
                                  : field.onChange(
                                      currentValue.filter(
                                        (value: string) => value !== perm.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal text-slate-700 cursor-pointer">
                            {perm.label}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <FormField
            control={form.control}
            name="permissions"
            render={() => (
              <FormItem>
                <FormMessage className="text-center mt-2" />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Role Configuration
          </Button>
        </div>
      </form>
    </Form>
  )
}
