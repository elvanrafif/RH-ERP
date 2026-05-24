import { z } from 'zod'

export const clientSchema = z.object({
  salutation: z.string().optional(),
  company_name: z.string().min(2, {
    message: 'Company/client name must be at least 2 characters.',
  }),
  email: z
    .string()
    .email({ message: 'Invalid email format.' })
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (val) => {
        if (!val) return true
        const digits = val.replace(/\D/g, '')
        return digits.length >= 10
      },
      {
        message: 'Phone number must have at least 8 digits.',
      }
    ),
  address: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || val.length >= 5, {
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
  pic_users: z.array(z.string()).optional(),
})

export type ClientFormValues = z.infer<typeof clientSchema>
