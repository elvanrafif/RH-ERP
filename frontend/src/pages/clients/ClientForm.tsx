import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientFormValues } from '@/lib/validations/client'
import type { Client } from '@/types'
import { useFormMutation } from '@/hooks/useFormMutation'
import { useUsers } from '@/hooks/useUsers'
import { ClientPicMultiSelectField } from '@/components/forms/ClientPicMultiSelectField'
import { PhoneInputField } from '@/components/forms/PhoneInputField'

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
import { Loader2, MapPin } from 'lucide-react'



const SALUTATIONS = ['Mr.', 'Mrs.', 'Ms.', 'Miss'] as const

interface ClientFormProps {
  onSuccess?: () => void
  initialData?: Client | null
}

export function ClientForm({ onSuccess, initialData }: ClientFormProps) {
  const { users } = useUsers()

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      salutation: initialData?.salutation ?? '',
      company_name: initialData?.company_name ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      address: initialData?.address ?? '',
      maps_link: initialData?.maps_link ?? '',
      pic_users: initialData?.pic_users ?? [],
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        salutation: initialData.salutation ?? '',
        company_name: initialData.company_name,
        email: initialData.email,
        phone: initialData.phone,
        address: initialData.address,
        maps_link: initialData.maps_link ?? '',
        pic_users: initialData.pic_users ?? [],
      })
    } else {
      form.reset({
        salutation: '',
        company_name: '',
        email: '',
        phone: '',
        address: '',
        maps_link: '',
        pic_users: [],
      })
    }
  }, [initialData, form])

  const mutation = useFormMutation<ClientFormValues>({
    collection: 'clients',
    queryKey: ['clients'],
    initialData,
    onSuccess,
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
      >
        <div className="grid grid-cols-[3fr_7fr] gap-4">
          <FormField
            control={form.control}
            name="salutation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Title{' '}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v === 'none' ? '' : v)}
                  value={field.value || 'none'}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {SALUTATIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Ismail Deyrian A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Email{' '}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. client@company.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <PhoneInputField
          control={form.control}
          setValue={form.setValue}
          name="phone"
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Complete Address{' '}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g. Jl. Kemang Raya No. 10, Jakarta Selatan"
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maps_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                Google Maps Link{' '}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g. https://maps.app.goo.gl/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ClientPicMultiSelectField control={form.control} users={users} />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {initialData ? 'Save Changes' : 'Create New Client'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
