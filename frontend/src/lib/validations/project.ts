import { z } from 'zod'

export const projectSchema = z.object({
  client_id: z.string().min(1, 'Please select a client'),
  assignee: z.string().optional(),
  status: z.string(),
  contract_value: z.coerce
    .number()
    .min(0)
    .optional() as z.ZodOptional<z.ZodNumber>,
  deadline: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  luas_tanah: z.coerce.number().optional() as z.ZodOptional<z.ZodNumber>,
  luas_bangunan: z.coerce.number().optional() as z.ZodOptional<z.ZodNumber>,
  pic_lapangan: z.string().optional(),
  pic_interior: z.string().optional(),
  area_scope: z.string().optional(),
  notes: z.string().optional(),
})

export type ProjectFormValues = z.infer<typeof projectSchema>
