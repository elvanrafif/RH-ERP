import { z } from 'zod'

export const roleFormSchema = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters'),
  permissions: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: 'You have to select at least one permission.',
    }),
})

export type RoleFormValues = z.infer<typeof roleFormSchema>
