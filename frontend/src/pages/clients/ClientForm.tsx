import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { clientSchema, type ClientFormValues } from '@/lib/validations/client'
import type { Client } from '@/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea' // 1. Import Textarea
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
  const queryClient = useQueryClient()

  // 1. Setup Form
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company_name: '',
      email: '',
      phone: '',
      address: '',
    },
  })

  // 2. Efek untuk mereset form jika mode berubah
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

  // 3. Setup Mutation
  const mutation = useMutation({
    mutationFn: async (values: ClientFormValues) => {
      if (initialData) {
        return await pb.collection('clients').update(initialData.id, values)
      } else {
        return await pb.collection('clients').create(values)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      onSuccess?.()
    },
    onError: (error) => {
      console.error(error)
      alert('Gagal menyimpan data client.')
    },
  })

  function onSubmit(values: ClientFormValues) {
    mutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Perusahaan / Klien</FormLabel>
              <FormControl>
                <Input placeholder="PT. Maju Mundur" {...field} />
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
                  <Input placeholder="email@contoh.com" {...field} />
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
                <FormLabel>Telepon / WA</FormLabel>
                <FormControl>
                  <Input placeholder="0812..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 4. Ganti Input menjadi Textarea disini */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat Lengkap</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Jl. Raya No. 1..."
                  className="min-h-[100px] resize-none" // Styling agar agak tinggi
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
            {initialData ? 'Simpan Perubahan' : 'Buat Client Baru'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
