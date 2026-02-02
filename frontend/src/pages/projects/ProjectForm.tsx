import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { pb } from "@/lib/pocketbase"
import { z } from "zod"
import type { Project, Client, User } from "@/types"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Loader2, Calendar as CalendarIcon } from "lucide-react"

// --- SCHEMA ---
const projectSchema = z.object({
  client_id: z.string().min(1, "Pilih klien"),
  assignee: z.string().optional(), 
  status: z.string(),
  value: z.coerce.number().min(0).optional(), 
  deadline: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  
  // Meta Data Inputs
  luas_tanah: z.coerce.number().optional(),
  luas_bangunan: z.coerce.number().optional(),
  pic_lapangan: z.string().optional(),
  pic_interior: z.string().optional(),
  area_scope: z.string().optional(),
  notes: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormProps {
  onSuccess?: () => void
  initialData?: Project | null
  fixedType: 'arsitektur' | 'sipil' | 'interior' 
  statusOptions: { value: string, label: string }[] 
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

export function ProjectForm({ onSuccess, initialData, fixedType, statusOptions }: ProjectFormProps) {
  const queryClient = useQueryClient()
  const user = pb.authStore.model;
  const isSuperAdmin = user?.role === 'superadmin' || user?.email === 'elvanrafif@gmail.com'; 

  // FETCH RELATIONS
  const { data: clients } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () => await pb.collection('clients').getFullList<Client>({ sort: 'company_name' })
  })
  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => await pb.collection('users').getFullList<User>()
  })

  // RUPIAH STATE
  const [displayValue, setDisplayValue] = useState("");

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      client_id: initialData?.client || "", 
      assignee: initialData?.assignee || "", 
      status: initialData?.status || statusOptions[0]?.value || "",
      value: initialData?.value || 0,
      deadline: initialData?.deadline ? initialData.deadline.substring(0, 10) : "",
      start_date: initialData?.start_date ? initialData.start_date.substring(0, 10) : "",
      end_date: initialData?.end_date ? initialData.end_date.substring(0, 10) : "",
      
      // Load Meta Data
      luas_tanah: initialData?.meta_data?.luas_tanah || 0,
      luas_bangunan: initialData?.meta_data?.luas_bangunan || 0,
      pic_lapangan: initialData?.meta_data?.pic_lapangan || "",
      pic_interior: initialData?.meta_data?.pic_interior || "",
      area_scope: initialData?.meta_data?.area_scope || "",
      notes: initialData?.meta_data?.notes || "",
    },
  })

  useEffect(() => {
      if (initialData?.value) setDisplayValue(formatRupiahDisplay(initialData.value));
  }, [initialData]);

  const mutation = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const meta_data = {
         luas_tanah: values.luas_tanah,
         luas_bangunan: values.luas_bangunan,
         pic_lapangan: values.pic_lapangan,
         pic_interior: values.pic_interior,
         area_scope: values.area_scope,
         notes: values.notes
      };

      const cleanValues = {
        client: values.client_id, 
        assignee: values.assignee || null,
        status: values.status,
        type: fixedType, 
        value: values.value,
        deadline: values.deadline || null,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        meta_data: meta_data 
      }
      
      if (initialData) {
        return await pb.collection('projects').update(initialData.id, cleanValues)
      } else {
        return await pb.collection('projects').create(cleanValues)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success(initialData ? "Berhasil diperbarui" : "Project berhasil dibuat");
      onSuccess?.()
    },
    onError: (err) => {
      console.error(err)
      toast.error("Gagal menyimpan project");
    }
  })

  const handleRupiahChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: number) => void) => {
    const rawValue = e.target.value.replace(/\./g, ""); 
    const numericValue = parseInt(rawValue) || 0; 
    setDisplayValue(formatRupiahDisplay(rawValue));
    onChange(numericValue);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="client_id" render={({ field }) => (
                <FormItem>
                <FormLabel>Klien / Nama Project</FormLabel>
                <Select onValueChange={field.onChange} value={field.value as string}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih Klien" /></SelectTrigger></FormControl>
                    <SelectContent>
                        {clients?.map((client) => (
                            <SelectItem key={client.id} value={client.id}>{client.company_name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )} />

            <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                <FormLabel>Status / Tahapan</FormLabel>
                <Select onValueChange={field.onChange} value={field.value as string}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        {statusOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )} />
        </div>

        {fixedType === 'sipil' && (
            <div className="grid grid-cols-2 gap-4 bg-amber-50 p-3 rounded border border-amber-100">
                <FormField control={form.control} name="start_date" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Mulai Kontrak</FormLabel>
                        <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
                    </FormItem>
                )} />
                <FormField control={form.control} name="end_date" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Selesai Kontrak</FormLabel>
                        <FormControl><Input type="date" {...field} value={field.value || ""} /></FormControl>
                    </FormItem>
                )} />
            </div>
        )}

        {(fixedType === 'arsitektur' || fixedType === 'sipil') && (
            <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="luas_tanah" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Luas Tanah (m²)</FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                placeholder="0"
                                {...field}
                                // FIX: Paksa jadi string kosong jika null/undefined
                                value={field.value ? String(field.value) : ""} 
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                        </FormControl>
                    </FormItem>
                )} />
                <FormField control={form.control} name="luas_bangunan" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Luas Bangunan (m²)</FormLabel>
                        <FormControl>
                            <Input 
                                type="number" 
                                placeholder="0"
                                {...field}
                                // FIX: Paksa jadi string kosong jika null/undefined
                                value={field.value ? String(field.value) : ""} 
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                        </FormControl>
                    </FormItem>
                )} />
            </div>
        )}

        {fixedType === 'interior' && (
            <div className="bg-emerald-50 p-3 rounded border border-emerald-100">
                <FormField control={form.control} name="area_scope" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Area / Scope (Misal: Kitchen Set & Master Bed)</FormLabel>
                        <FormControl><Input placeholder="Ketik area pengerjaan..." {...field} value={field.value || ""} /></FormControl>
                    </FormItem>
                )} />
            </div>
        )}

        <div className="grid grid-cols-2 gap-4">
            {fixedType !== 'sipil' && (
             <FormField control={form.control} name="assignee" render={({ field }) => (
                <FormItem>
                <FormLabel>PIC Design / Drafter</FormLabel>
                <Select onValueChange={field.onChange} value={field.value as string}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Pilih Drafter" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                        {users?.map((user) => (
                            <SelectItem key={user.id} value={user.id}>{user.name || user.email}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                </FormItem>
            )} />
            )}

            {fixedType === 'sipil' && (
                 <FormField control={form.control} name="pic_lapangan" render={({ field }) => (
                    <FormItem>
                    <FormLabel>PIC Lapangan</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value as string}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih Mandor/Pengawas" /></SelectTrigger></FormControl>
                        <SelectContent>
                            {["Pak Sur", "Sarman", "Sugeng", "Pak Ipan", "Mas Dayat"].map((p) => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    </FormItem>
                )} />
            )}

            {fixedType === 'interior' && (
                 <FormField control={form.control} name="pic_interior" render={({ field }) => (
                    <FormItem>
                    <FormLabel>PIC Interior</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value as string}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih PIC" /></SelectTrigger></FormControl>
                        <SelectContent>
                            <SelectItem value="Mutia">Mutia</SelectItem>
                            <SelectItem value="Baru">Baru</SelectItem>
                        </SelectContent>
                    </Select>
                    </FormItem>
                )} />
            )}
        </div>

        {isSuperAdmin && (
             <FormField control={form.control} name="value" render={({ field }) => (
                <FormItem>
                <FormLabel>Nilai Project (Confidential)</FormLabel>
                <FormControl>
                    <div className="relative">
                        <span className="absolute left-3 top-2 text-sm text-gray-500 font-semibold">Rp</span>
                        <Input type="text" className="pl-9 font-medium"
                            placeholder="0" value={displayValue} 
                            onChange={(e) => handleRupiahChange(e, field.onChange)} 
                        />
                    </div>
                </FormControl>
                </FormItem>
            )} />
        )}

        <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem>
                <FormLabel>Notes / Catatan</FormLabel>
                <FormControl><Textarea {...field} value={field.value || ""} /></FormControl>
            </FormItem>
        )} />

        <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Project
            </Button>
        </div>
      </form>
    </Form>
  )
}