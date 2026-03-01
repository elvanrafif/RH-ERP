import { z } from 'zod'

export const userFormSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z
      .string()
      .refine((val) => val === '' || /^\d+$/.test(val), 'Numbers only')
      .refine((val) => val === '' || val.length >= 10, 'Minimum 10 digits')
      .optional(),
    oldPassword: z.string().optional(),
    password: z.string().optional(),
    passwordConfirm: z.string().optional(),
    roleId: z.string().min(1, 'Please select a system role'),
    division: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })
  .superRefine((data, ctx) => {
    if (data.password && data.password.length > 0 && data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must be at least 8 characters',
        path: ['password'],
      })
    }
  })

export type UserFormValues = z.infer<typeof userFormSchema>
