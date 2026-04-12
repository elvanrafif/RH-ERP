import { z } from 'zod'

export const vendorSchema = z.object({
  name: z.string().min(2, {
    message: 'Nama vendor minimal 2 karakter.',
  }),
  phone: z.string().min(10, {
    message: 'Nomor telepon minimal 10 digit.',
  }),
  project_type: z.enum(['civil', 'interior'], {
    error: 'Project type wajib dipilih.',
  }),
  notes: z.string().optional(),
})

export type VendorFormValues = z.infer<typeof vendorSchema>
