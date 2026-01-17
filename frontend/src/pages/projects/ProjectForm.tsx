import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { pb } from "@/lib/pocketbase"
import { z } from "zod"
import type { Project, Client, User } from "@/types"
import { toast } from "sonner" // IMPORT TOAST

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Loader2, Calendar as CalendarIcon } from "lucide-react"

// 1. SCHEMA
const projectSchema = z.object({
  name: z.string().min(3, "Nama project minimal 3 karakter"),
  client_id: z.string().min(1, "Pilih klien"),
  assignee: z.string(), 
  status: z.string(),
  type: z.string(),
  value: z.coerce.number().min(0, "Nilai tidak boleh negatif"), 
  deadline: z.string(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormProps {
  onSuccess?: () => void
  initialData?: Project | null
}

const formatRupiahDisplay = (value: number | string) => {
    if (!value) return "";
    const numberString = value.toString().replace(/[^,\d]/g, "");
    const split = numberString.split(",");
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        const separator = sisa ? "." : "";
        rupiah += separator + ribuan.join(".");
    }

    return split[1] !== undefined ? rupiah + "," + split[1] : rupiah;
}

export function ProjectForm({ onSuccess, initialData }: ProjectFormProps) {
  const queryClient = useQueryClient()
  
  // FETCH DATA LIST (CLIENTS & USERS)
  const { data: clients, isLoading: loadingClients } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () => await pb.collection('clients').getFullList<Client>({ sort: 'company_name' })
  })

  const { data: users, isLoading: loadingUsers } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => await pb.collection('users').getFullList<User>()
  })

  // PERSIAPAN DATA AWAL (DEFAULT VALUES)
  let formattedDeadline = "";
  if (initialData?.deadline && initialData.deadline.length >= 10) {
      formattedDeadline = initialData.deadline.substring(0, 10);
  }

  // STATE RUPIAH
  const [displayValue, setDisplayValue] = useState(
    initialData ? formatRupiahDisplay(initialData.value) : ""
  );

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: initialData?.name || "",
      client_id: initialData?.client_id || "",
      assignee: initialData?.assignee || "", 
      status: initialData?.status || "todo",
      type: initialData?.type || "others",
      value: initialData?.value || 0,
      deadline: formattedDeadline,
    },
  })

  // MUTATION
  const mutation = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const cleanValues = {
        ...values,
        assignee: values.assignee === "" ? null : values.assignee,
        deadline: values.deadline === "" ? null : values.deadline,
      }
      
      if (initialData) {
        return await pb.collection('projects').update(initialData.id, cleanValues)
      } else {
        return await pb.collection('projects').create(cleanValues)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      // TOAST SUKSES
      toast.success(initialData ? "Project berhasil diperbarui!" : "Project baru berhasil dibuat!");
      onSuccess?.()
    },
    onError: (err) => {
      console.error(err)
      // TOAST ERROR
      toast.error("Gagal menyimpan project. Silakan cek koneksi atau input Anda.");
    }
  })

  const handleRupiahChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: number) => void) => {
    const rawValue = e.target.value.replace(/\./g, ""); 
    const numericValue = parseInt(rawValue) || 0; 
    setDisplayValue(formatRupiahDisplay(rawValue));
    onChange(numericValue);
  }

  // === SOLUSI UTAMA (BLOCKING RENDER) ===
  if (loadingClients || loadingUsers) {
      return (
          <div className="flex h-40 items-center justify-center space-x-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Memuat data form...</span>
          </div>
      )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data as ProjectFormValues))} className="space-y-4">
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Project</FormLabel>
              <FormControl>
                <Input placeholder="Contoh: Renovasi Rumah..." {...field} value={field.value as string} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Klien</FormLabel>
                <Select onValueChange={field.onChange} value={field.value as string}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih Klien" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {clients?.map((client) => (
                            <SelectItem key={client.id} value={client.id}>{client.company_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />

             <FormField
            control={form.control}
            name="assignee"
            render={({ field }) => (
                <FormItem>
                <FormLabel>PIC / Assignee</FormLabel>
                <Select onValueChange={field.onChange} value={field.value as string}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih PIC" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="unassigned" onClick={() => form.setValue("assignee", "")}>-- Lepas PIC --</SelectItem>
                        {users?.map((user) => (
                            <SelectItem key={user.id} value={user.id}>{user.name || user.email}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tipe Pekerjaan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value as string}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="sipil">Sipil</SelectItem>
                            <SelectItem value="others">Others</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status Awal</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value as string}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="doing">In Progress</SelectItem>
                            <SelectItem value="review">Review</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
             <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Nilai Project (Rp)</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-sm text-gray-500 font-semibold">Rp</span>
                            <Input 
                                type="text" 
                                className="pl-9 font-medium"
                                placeholder="0"
                                value={displayValue} 
                                onChange={(e) => handleRupiahChange(e, field.onChange)} 
                            />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

             <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Input 
                                type="date" 
                                {...field} 
                                value={field.value as string} 
                                className="block w-full" 
                            />
                            <CalendarIcon className="absolute right-3 top-2.5 h-4 w-4 text-gray-500 pointer-events-none" />
                        </div>
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? "Simpan Perubahan" : "Buat Project"}
            </Button>
        </div>
      </form>
    </Form>
  )
}