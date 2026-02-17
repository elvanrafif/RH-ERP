import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Loader2, Save } from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string(),
  phone: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export function ProfileEditForm({ user }: { user: User }) {
  const queryClient = useQueryClient()

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    },
  })

  const mutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      return await pb.collection('users').update(user.id, {
        name: values.name,
        phone: values.phone,
      })
    },
    onSuccess: (data) => {
      pb.authStore.save(pb.authStore.token, data)
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('Profile updated successfully')
    },
    onError: () => toast.error('Failed to update profile'),
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-4 max-w-lg"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (Login ID)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled
                  className="bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </FormControl>
              <p className="text-[10px] text-muted-foreground">
                Email address cannot be changed.
              </p>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number / WhatsApp</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="0812xxxx"
                  inputMode="numeric"
                  onChange={(e) =>
                    field.onChange(e.target.value.replace(/\D/g, ''))
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-2 mt-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Profile
          </Button>
        </div>
      </form>
    </Form>
  )
}
