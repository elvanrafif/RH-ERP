import { z } from 'zod'

export const vendorSchema = z.object({
  name: z.string().min(2, {
    message: 'Vendor name must be at least 2 characters.',
  }),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits.',
  }),
  project_type: z.enum(['civil', 'interior'], {
    error: 'Project type is required.',
  }),
  isActive: z.boolean(),
  notes: z.string().optional(),
})

export type VendorFormValues = z.infer<typeof vendorSchema>
