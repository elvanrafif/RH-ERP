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
import { ProjectNotesField } from '../components/ProjectNotesField'
import { ProjectStatusSelectField } from '../components/ProjectStatusSelectField'
import { ProjectDeadlineField } from '../components/ProjectDeadlineField'
import { InteriorVendorField } from './components/InteriorVendorField'
import { getInteriorFormDefaults, buildInteriorPayload } from './interiorFormHelpers'
import { FormSubmitButton } from '@/components/shared/FormSubmitButton'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'

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
          <ProjectStatusSelectField control={form.control} options={STATUS_OPTIONS} />
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
          <ProjectDeadlineField control={form.control} />
        </div>

        <AdditionalLinksField control={form.control} />

        <LinkedInvoiceSelectField control={form.control} linkedInvoices={linkedInvoices} />

        <ProjectNotesField control={form.control} />
        <FormSubmitButton isPending={isPending} label="Save Project" />
      </form>
    </Form>
  )
}
