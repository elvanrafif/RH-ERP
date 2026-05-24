import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Project } from '@/types'
import { PROJECT_TYPE_TO_DIVISION } from '@/lib/constant'
import { MaskingTextByArchitectureStatus } from '@/lib/masking'
import { useRole } from '@/hooks/useRole'
import { useUsers } from '@/hooks/useUsers'
import { useLinkedInvoices } from '@/hooks/useInvoices'
import { useProjectMutation } from '@/hooks/useProjects'
import { projectSchema, type ProjectFormValues } from '@/lib/validations/project'
import { ClientComboboxField } from '@/components/forms/ClientComboboxField'
import { AdditionalLinksField } from '@/components/forms/AdditionalLinksField'
import { AreaFields } from '../components/AreaFields'
import { LinkedInvoiceSelectField } from '../components/LinkedInvoiceSelectField'
import { ProjectPicSelectField } from '../components/ProjectPicSelectField'
import { ProjectNotesField } from '../components/ProjectNotesField'
import { ProjectStatusSelectField } from '../components/ProjectStatusSelectField'
import { ProjectDeadlineField } from '../components/ProjectDeadlineField'
import { getArchitectureFormDefaults, buildArchitecturePayload } from './architectureFormHelpers'
import { FormSubmitButton } from '@/components/shared/FormSubmitButton'
import { Input } from '@/components/ui/input'
import { Form } from '@/components/ui/form'

const STATUS_OPTIONS = ['denah', 'fasad', 'detail_drawing', 'finish'].map((value) => ({
  value,
  label: MaskingTextByArchitectureStatus(value),
}))

interface ProjectArchitectureFormProps {
  onSuccess?: () => void
  initialData?: Project | null
}

export function ProjectArchitectureForm({
  onSuccess,
  initialData,
}: ProjectArchitectureFormProps) {
  const { isSuperAdmin, user } = useRole()
  const { users } = useUsers()

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: getArchitectureFormDefaults(initialData, isSuperAdmin, user?.id) as any,
  })

  const clientId = form.watch('client_id')
  const { linkedInvoices } = useLinkedInvoices('design', clientId, isSuperAdmin && !!clientId)

  const availableUsers =
    users?.filter(
      (u) =>
        u.division?.toLowerCase() === PROJECT_TYPE_TO_DIVISION['architecture']
    ) ?? []
  if (!isSuperAdmin && user && !availableUsers.find((u) => u.id === user.id)) {
    availableUsers.push(user)
  }

  const { mutate, isPending } = useProjectMutation(initialData, onSuccess)

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutate(buildArchitecturePayload(data as any)))}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ClientComboboxField control={form.control} name="client_id" />
          <ProjectStatusSelectField control={form.control} options={STATUS_OPTIONS} />
        </div>

        <AreaFields control={form.control} />

        <div className="grid grid-cols-2 gap-4">
          <ProjectPicSelectField control={form.control} users={availableUsers} label="PIC Design / Drafter" />
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
