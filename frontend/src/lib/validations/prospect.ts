import { z } from 'zod'

export const prospectSchema = z.object({
  instagram: z.string().min(1, { message: 'Instagram handle is required.' }),
  client_name: z.string().min(1, { message: 'Client name is required.' }),
  phone: z.string().min(1, { message: 'Phone number is required.' }),
  address: z.string().optional(),
  land_size: z.coerce.number().positive().optional().or(z.literal('')),
  needs: z.array(z.string()).default([]),
  floor: z.string().optional(),
  renovation_type: z.string().optional(),
  status: z.string().min(1, { message: 'Status is required.' }),
  notes: z.string().optional(),
  meeting_schedule: z.string().optional(),
  confirmation: z.string().optional(),
  quotation: z.string().optional(),
  survey_schedule: z.string().optional(),
  result: z.string().optional(),
})

export type ProspectFormValues = z.infer<typeof prospectSchema>
