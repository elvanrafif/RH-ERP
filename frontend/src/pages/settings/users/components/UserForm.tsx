import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { pb } from "@/lib/pocketbase"
import { z } from "zod"
import type { User } from "@/types"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Loader2, KeyRound, X } from "lucide-react"

// --- SCHEMA ---
const userFormSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  // VALIDASI PHONE: String, tapi isinya harus angka, minimal 10 digit, boleh kosong
  phone: z.string()
    .refine((val) => val === "" || /^\d+$/.test(val), "Hanya boleh angka")
    .refine((val) => val === "" || val.length >= 10, "Minimal 10 digit")
    .optional(),
  password: z.string().optional(),
  passwordConfirm: z.string().optional(),
  role: z.string().min(1, "Role harus dipilih"),
  division: z.string().optional(),
}).refine((data) => {
    if (data.password !== data.passwordConfirm) return false;
    return true;
}, {
    message: "Konfirmasi password tidak sesuai",
    path: ["passwordConfirm"],
}).superRefine((data, ctx) => {
    if (data.password && data.password.length > 0 && data.password.length < 8) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Password minimal 8 karakter",
            path: ["password"],
        });
    }
});

type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormProps {
    initialData?: User | null;
    onSuccess: () => void;
}

export function UserForm({ initialData, onSuccess }: UserFormProps) {
    const queryClient = useQueryClient();
    const isEdit = !!initialData;
    
    const [showResetPassword, setShowResetPassword] = useState(false);

    const form = useForm({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            name: initialData?.name || "",
            email: initialData?.email || "",
            // DEFAULT PHONE
            phone: initialData?.phone || "",
            role: initialData?.role || "employee",
            division: initialData?.division || "",
            password: "",
            passwordConfirm: "",
        },
    });

    const mutation = useMutation({
        mutationFn: async (values: UserFormValues) => {
            const payload: any = {
                name: values.name,
                // PAYLOAD PHONE
                phone: values.phone,
                role: values.role, 
                division: values.division,
                emailVisibility: true,
            };

            if (isEdit && initialData) {
                // UPDATE LOGIC
                if (values.password && values.password.length > 0) {
                    if (values.password.length < 8) throw new Error("Password baru minimal 8 karakter");
                    payload.password = values.password;
                    payload.passwordConfirm = values.passwordConfirm;
                }
                return await pb.collection('users').update(initialData.id, payload);
            } else {
                // CREATE LOGIC
                payload.email = values.email.trim();
                if (!values.password || values.password.length < 8) {
                    throw new Error("Password wajib diisi (min 8 karakter) untuk user baru");
                }
                payload.password = values.password;
                payload.passwordConfirm = values.passwordConfirm;
                return await pb.collection('users').create(payload);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users-management'] });
            toast.success(isEdit ? "Data user diperbarui" : "User baru berhasil dibuat");
            onSuccess();
        },
        onError: (err: any) => {
            console.error("PocketBase Error:", err);
            let errorMsg = "Gagal menyimpan user.";
            if (err?.data?.data) {
                const firstKey = Object.keys(err.data.data)[0];
                if (firstKey) {
                    errorMsg = `${firstKey}: ${err.data.data[firstKey].message}`;
                }
            } else if (err?.message) {
                errorMsg = err.message;
            }
            toast.error(errorMsg);
        }
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                
                {/* --- INFORMASI UMUM --- */}
                <div className="space-y-3">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Lengkap</FormLabel>
                            <FormControl><Input placeholder="Contoh: Pak Sarman" {...field} value={field.value || ""} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    
                    {/* GRID: EMAIL & PHONE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email (Login)</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="nama@internal.rh" 
                                        {...field} 
                                        value={field.value || ""} 
                                        disabled={isEdit} 
                                        className={isEdit ? "bg-slate-100 text-slate-500 cursor-not-allowed" : ""}
                                    />
                                </FormControl>
                                {isEdit && <p className="text-[10px] text-muted-foreground">Email tidak dapat diubah.</p>}
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* FIELD PHONE NUMBER */}
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem>
                                <FormLabel>No. HP / WhatsApp</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field}
                                        value={field.value || ""}
                                        placeholder="0812xxxxxx"
                                        type="text" 
                                        inputMode="numeric" // Keyboard angka di HP
                                        onChange={(e) => {
                                            // LOGIC: Hanya terima angka
                                            const val = e.target.value.replace(/\D/g, "");
                                            field.onChange(val);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                     <FormField control={form.control} name="division" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Divisi</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Pilih Divisi" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="management">Management / Admin</SelectItem>
                                    <SelectItem value="arsitektur">Arsitektur</SelectItem>
                                    <SelectItem value="sipil">Sipil (Lapangan)</SelectItem>
                                    <SelectItem value="interior">Interior</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="role" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Role System</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "employee"}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="employee">Employee / User</SelectItem>
                                    <SelectItem value="superadmin">Superadmin</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                {/* --- BAGIAN PASSWORD (LOGIC RESET) --- */}
                <div className="border-t pt-4 mt-4">
                    {!isEdit && (
                        <div className="space-y-4">
                            <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <KeyRound className="h-4 w-4" /> Setup Password Awal
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="password" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl><Input type="password" placeholder="Min 8 karakter" {...field} value={field.value || ""} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="passwordConfirm" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Konfirmasi</FormLabel>
                                        <FormControl><Input type="password" {...field} value={field.value || ""} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                    )}

                    {isEdit && !showResetPassword && (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-medium text-slate-700">Keamanan</p>
                            <div className="bg-slate-50 p-3 rounded border flex items-center justify-between">
                                <div className="text-xs text-muted-foreground">
                                    Password tersembunyi demi keamanan.
                                </div>
                                <Button 
                                    type="button" variant="outline" size="sm" 
                                    className="text-amber-700 border-amber-200 hover:bg-amber-50"
                                    onClick={() => setShowResetPassword(true)}
                                >
                                    <KeyRound className="mr-2 h-3.5 w-3.5" /> Reset Password
                                </Button>
                            </div>
                        </div>
                    )}

                    {isEdit && showResetPassword && (
                        <div className="space-y-4 bg-amber-50/50 p-4 rounded border border-amber-200 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                                    <KeyRound className="h-4 w-4" /> Reset Password User
                                </p>
                                <Button 
                                    type="button" variant="ghost" size="sm" className="h-8 w-8"
                                    onClick={() => {
                                        setShowResetPassword(false);
                                        form.setValue("password", "");
                                        form.setValue("passwordConfirm", "");
                                    }}
                                >
                                    <X className="h-4 w-4 text-slate-500" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="password" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-amber-900">Password Baru</FormLabel>
                                        <FormControl><Input type="password" className="bg-white" {...field} value={field.value || ""} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="passwordConfirm" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-amber-900">Konfirmasi</FormLabel>
                                        <FormControl><Input type="password" className="bg-white" {...field} value={field.value || ""} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? "Update Data User" : "Buat User Baru"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}