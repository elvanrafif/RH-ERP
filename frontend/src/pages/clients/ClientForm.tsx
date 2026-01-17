import { useEffect } from "react" // Tambah useEffect
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient, useMutation } from "@tanstack/react-query"
import { pb } from "@/lib/pocketbase"
import { clientSchema, type ClientFormValues } from "@/lib/validations/client"
import type { Client } from "@/types" // Import tipe Client

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Loader2 } from "lucide-react"

interface ClientFormProps {
  onSuccess?: () => void
  initialData?: Client | null // Tambah props data awal (opsional)
}

export function ClientForm({ onSuccess, initialData }: ClientFormProps) {
  const queryClient = useQueryClient()
  
  // 1. Setup Form
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company_name: "",
      email: "",
      phone: "",
      address: "",
    },
  })

  // 2. Efek untuk mereset form jika mode berubah (Edit <-> Create)
  useEffect(() => {
    if (initialData) {
      // Jika mode Edit, isi form dengan data lama
      form.reset({
        company_name: initialData.company_name,
        email: initialData.email,
        phone: initialData.phone,
        address: initialData.address,
      })
    } else {
      // Jika mode Create, kosongkan form
      form.reset({
        company_name: "",
        email: "",
        phone: "",
        address: "",
      })
    }
  }, [initialData, form])

  // 3. Setup Mutation (Bisa Create atau Update)
  const mutation = useMutation({
    mutationFn: async (values: ClientFormValues) => {
      if (initialData) {
        // MODE EDIT: Update data berdasarkan ID
        return await pb.collection('clients').update(initialData.id, values)
      } else {
        // MODE CREATE: Buat baru
        return await pb.collection('clients').create(values)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      onSuccess?.()
    },
    onError: (error) => {
      console.error(error)
      alert("Gagal menyimpan data client.")
    }
  })

  function onSubmit(values: ClientFormValues) {
    mutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        
        {/* ... (BAGIAN FIELD INPUT SAMA SEPERTI SEBELUMNYA, TIDAK BERUBAH) ... */}
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
        {/* ... (Field Email, Phone, Address biarkan sama, copas saja yg lama) ... */}
        
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

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Jl. Raya No. 1..." {...field} />
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
            {/* Ubah teks tombol sesuai mode */}
            {initialData ? "Simpan Perubahan" : "Buat Client Baru"}
            </Button>
        </div>
      </form>
    </Form>
  )
}