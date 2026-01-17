import { z } from "zod"

export const clientSchema = z.object({
    company_name: z.string().min(2, {
        message: "Nama perusahaan/klien minimal 2 karakter.",
    }),
    email: z.string().email({
        message: "Format email tidak valid.",
    }),
    phone: z.string().min(10, {
        message: "Nomor telepon minimal 10 digit.",
    }),
    address: z.string().min(5, {
        message: "Alamat minimal 5 karakter.",
    }),
})

// Kita export tipe datanya otomatis dari schema di atas
export type ClientFormValues = z.infer<typeof clientSchema>