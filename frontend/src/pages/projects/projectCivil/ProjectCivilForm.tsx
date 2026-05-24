import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Project } from '@/types'
import { DIVISION } from '@/lib/constant'
import { useRole } from '@/hooks/useRole'
import { useUsers } from '@/hooks/useUsers'
import { useVendors } from '@/hooks/useVendors'
import { useLinkedInvoices } from '@/hooks/useInvoices'
import { useProjectMutation } from '@/hooks/useProjects'
import { projectSchema } from '@/lib/validations/project'
import { ClientComboboxField } from '@/components/forms/ClientComboboxField'
import { AdditionalLinksField } from '@/components/forms/AdditionalLinksField'
import { AreaFields } from '../components/AreaFields'
import { LinkedInvoiceSelectField } from '../components/LinkedInvoiceSelectField'
import { ProjectPicSelectField } from '../components/ProjectPicSelectField'
import { ProjectNotesField } from '../components/ProjectNotesField'
import { ProjectStatusSelectField } from '../components/ProjectStatusSelectField'
import { ProjectVendorSelectField } from '../components/ProjectVendorSelectField'
import { CivilContractDatesField } from './components/CivilContractDatesField'
import { SourceArchitectureSelectField } from './components/SourceArchitectureSelectField'
import { getCivilFormDefaults, buildCivilPayload } from './civilFormHelpers'
import { FormSubmitButton } from '@/components/shared/FormSubmitButton'
import { Form } from '@/components/ui/form'
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
  const { isSuperAdmin } = useRole()
  const { users } = useUsers()

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
    defaultValues: getCivilFormDefaults(initialData),
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

  const { linkedInvoices } = useLinkedInvoices('sipil', clientId, isSuperAdmin && !!clientId)
  const { mutate, isPending } = useProjectMutation(initialData, onSuccess)

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutate(buildCivilPayload(data)))}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ClientComboboxField control={form.control} name="client_id" />
          <ProjectStatusSelectField control={form.control} options={STATUS_OPTIONS} label="Project Status" />
        </div>

        {/* Contract dates */}
        <CivilContractDatesField control={form.control} />

        {/* Land + Building area */}
        <AreaFields control={form.control} />

        {/* Source architecture */}
        <SourceArchitectureSelectField
          control={form.control}
          architectureProjects={architectureProjects}
          users={users}
        />

        {/* Managed By + Field PIC */}
        <div className="grid grid-cols-2 gap-4">
          <ProjectPicSelectField
            control={form.control}
            users={civilUsers ?? []}
            label="Managed By"
          />
          <ProjectVendorSelectField control={form.control} vendors={resolvedCivilVendors} label="Field PIC" placeholder="Select Supervisor" />
        </div>

        <AdditionalLinksField control={form.control} />

        <LinkedInvoiceSelectField control={form.control} linkedInvoices={linkedInvoices} />

        <ProjectNotesField control={form.control} />
        <FormSubmitButton isPending={isPending} label="Save Project" />
      </form>
    </Form>
  )
}
