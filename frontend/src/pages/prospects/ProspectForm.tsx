import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  prospectSchema,
  type ProspectFormValues,
} from '@/lib/validations/prospect'
import type { Prospect } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useProspectMutation } from '@/hooks/useProspectMutation'
import { PROSPECT_STATUS } from '@/lib/constant'
import { toLocalDateTimeInput } from '@/lib/helpers'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Loader2 } from 'lucide-react'
import { ProspectContactFields } from './ProspectContactFields'
import { ProspectPropertyFields } from './ProspectPropertyFields'
import { ProspectScheduleFields } from './ProspectScheduleFields'

interface ProspectFormProps {
  onSuccess?: () => void
  initialData?: Prospect | null
}

export function ProspectForm({ onSuccess, initialData }: ProspectFormProps) {
  const { isSuperAdmin } = useAuth()
  const mutation = useProspectMutation({ initialData, onSuccess })

  const form = useForm<ProspectFormValues>({
    resolver: zodResolver(prospectSchema),
    defaultValues: {
      instagram: initialData?.instagram ?? '',
      client_name: initialData?.client_name ?? '',
      phone: initialData?.phone ?? '',
      address: initialData?.address ?? '',
      land_size: initialData?.land_size ?? undefined,
      needs: initialData?.needs ?? [],
      floor: initialData?.floor ?? '',
      renovation_type: initialData?.renovation_type ?? '',
      status: initialData?.status ?? PROSPECT_STATUS.WAITING,
      notes: initialData?.notes ?? '',
      meeting_schedule: toLocalDateTimeInput(initialData?.meeting_schedule),
      confirmation: initialData?.confirmation ?? '',
      quotation: initialData?.quotation ?? '',
      survey_schedule: toLocalDateTimeInput(initialData?.survey_schedule),
      result: initialData?.result ?? '',
    },
  })

  const needsValue = useWatch({ control: form.control, name: 'needs' }) ?? []

  function handleNeedsToggle(option: string, checked: boolean) {
    const current = form.getValues('needs') ?? []
    form.setValue(
      'needs',
      checked ? [...current, option] : current.filter((n) => n !== option),
      { shouldValidate: true }
    )
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
        className="space-y-4"
      >
        <ProspectContactFields control={form.control} />
        <ProspectPropertyFields
          control={form.control}
          needsValue={needsValue}
          onNeedsToggle={handleNeedsToggle}
        />
        <ProspectScheduleFields
          control={form.control}
          isSuperAdmin={isSuperAdmin}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {initialData ? 'Save Changes' : 'Add Prospect'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
