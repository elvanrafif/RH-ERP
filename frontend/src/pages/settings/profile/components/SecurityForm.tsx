import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { z } from 'zod'
import type { User } from '@/types'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, KeyRound } from 'lucide-react'

// Schema: Old Password, New Password, Confirm
const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Old password is required'),
    password: z.string().min(8, 'New password must be at least 8 characters'),
    passwordConfirm: z.string().min(1, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'New passwords do not match',
    path: ['passwordConfirm'],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

export function SecurityForm({ user }: { user: User }) {
  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      password: '',
      passwordConfirm: '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: PasswordFormValues) => {
      // PocketBase Self-Update Password Logic
      return await pb.collection('users').update(user.id, {
        oldPassword: values.oldPassword,
        password: values.password,
        passwordConfirm: values.passwordConfirm,
      })
    },
    onSuccess: () => {
      toast.success('Password changed successfully')
      form.reset() // Clear input setelah sukses agar aman
    },
    onError: (err: any) => {
      console.error(err)
      // Handle error spesifik "Invalid old password"
      const errorData = err?.data?.data
      if (errorData?.oldPassword) {
        form.setError('oldPassword', { message: 'Incorrect old password' })
        toast.error('Failed: Incorrect old password')
      } else {
        toast.error('Failed to change password')
      }
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-4 max-w-lg"
      >
        <div className="bg-amber-50 p-3 rounded border border-amber-200 text-xs text-amber-800 mb-4">
          For security reasons, you must enter your old password before creating
          a new one.
        </div>

        <FormField
          control={form.control}
          name="oldPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Old Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Min 8 characters"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="passwordConfirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={mutation.isPending}
            variant="destructive"
            className="text-white"
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="mr-2 h-4 w-4" />
            )}
            Change Password
          </Button>
        </div>
      </form>
    </Form>
  )
}
