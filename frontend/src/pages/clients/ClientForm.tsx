import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientFormValues } from '@/lib/validations/client'
import type { Client } from '@/types'
import { useFormMutation } from '@/hooks/useFormMutation'

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
import { Loader2 } from 'lucide-react'

interface ClientFormProps {
  onSuccess?: () => void
  initialData?: Client | null
}

export function ClientForm({ onSuccess, initialData }: ClientFormProps) {
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company_name: '',
      email: '',
      phone: '',
      address: '',
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        company_name: initialData.company_name,
        email: initialData.email,
        phone: initialData.phone,
        address: initialData.address,
      })
    } else {
      form.reset({
        company_name: '',
        email: '',
        phone: '',
        address: '',
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
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company / Client Name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Corp" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone / WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="0812..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Complete Address</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="123 Main St..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
