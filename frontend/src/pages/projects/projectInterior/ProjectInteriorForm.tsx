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
import { ClientComboboxField } from '@/components/forms/ClientComboboxField'
import { AdditionalLinksField } from '@/components/forms/AdditionalLinksField'
import { LinkedInvoiceSelectField } from '../components/LinkedInvoiceSelectField'
import { ProjectPicSelectField } from '../components/ProjectPicSelectField'
import { InteriorVendorField } from './components/InteriorVendorField'
import { getInteriorFormDefaults, buildInteriorPayload } from './interiorFormHelpers'
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

  const { vendors: interiorVendors } = useVendors({
    projectType: 'interior',
    activeOnly: true,
  })
  const resolvedInteriorVendors =
    initialData?.vendor &&
    initialData?.expand?.vendor &&
    !interiorVendors.find((v) => v.id === initialData.vendor)
      ? [...interiorVendors, initialData.expand.vendor]
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
    defaultValues: getInteriorFormDefaults(initialData, isSuperAdmin, user?.id),
  })

  const clientId = form.watch('client_id')

  const { linkedInvoices } = useLinkedInvoices('interior', clientId, isSuperAdmin && !!clientId)
  const { mutate, isPending } = useProjectMutation(initialData, onSuccess)

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutate(buildInteriorPayload(data)))}
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
          <ProjectPicSelectField
            control={form.control}
            users={availableUsers}
            label="Interior PIC"
          />
          <InteriorVendorField control={form.control} vendors={resolvedInteriorVendors} />
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

        <LinkedInvoiceSelectField control={form.control} linkedInvoices={linkedInvoices} />

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
