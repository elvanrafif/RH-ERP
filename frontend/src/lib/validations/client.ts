import { z } from 'zod'

export const clientSchema = z.object({
  company_name: z.string().min(2, {
    message: 'Company/client name must be at least 2 characters.',
  }),
  email: z
    .string()
    .email({ message: 'Invalid email format.' })
    .optional()
    .or(z.literal('')),
  phone: z.string().min(8, {
    message: 'Phone number must be at least 8 digits.',
  }),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters.',
  }),
  maps_link: z
    .string()
    .url({ message: 'Invalid URL format.' })
    .refine(
      (val) =>
        val === '' ||
        val.includes('google.com/maps') ||
        val.includes('maps.app.goo.gl') ||
        val.includes('goo.gl/maps'),
      { message: 'Must be a Google Maps link.' }
    )
    .optional()
    .or(z.literal('')),
})

export type ClientFormValues = z.infer<typeof clientSchema>
