import { z } from 'zod'

export const userFormSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
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
          message: 'Phone number must have at least 10 digits.',
        }
      ),
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
    if (data.password && data.password.length > 0) {
      if (data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password must be 8–16 characters',
          path: ['password'],
        })
      }
      if (data.password.length > 16) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password must be 8–16 characters',
          path: ['password'],
        })
      }
    }
  })

export type UserFormValues = z.infer<typeof userFormSchema>
