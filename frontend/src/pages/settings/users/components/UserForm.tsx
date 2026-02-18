import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, KeyRound, X, Mail } from 'lucide-react'

// --- SCHEMA ---
const userFormSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z
      .string()
      .refine((val) => val === '' || /^\d+$/.test(val), 'Numbers only')
      .refine((val) => val === '' || val.length >= 10, 'Minimum 10 digits')
      .optional(),
    oldPassword: z.string().optional(), // <-- TAMBAHAN: Field untuk password lama
    password: z.string().optional(),
    passwordConfirm: z.string().optional(),
    roleId: z.string().min(1, 'Please select a system role'),
    division: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password !== data.passwordConfirm) return false
      return true
    },
    {
      message: 'Passwords do not match',
      path: ['passwordConfirm'],
    }
  )
  .superRefine((data, ctx) => {
    if (data.password && data.password.length > 0 && data.password.length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must be at least 8 characters',
        path: ['password'],
      })
    }
  })

type UserFormValues = z.infer<typeof userFormSchema>

interface UserFormProps {
  initialData?: User | null
  onSuccess: () => void
}

export function UserForm({ initialData, onSuccess }: UserFormProps) {
  const queryClient = useQueryClient()
  const isEdit = !!initialData
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  // --- FETCH DYNAMIC ROLES ---
  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles-list'],
    queryFn: async () =>
      await pb.collection('roles').getFullList({ sort: 'name' }),
  })

  const form = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      roleId: (initialData as any)?.roleId || '',
      division: initialData?.division || '',
      oldPassword: '', // <-- TAMBAHAN
      password: '',
      passwordConfirm: '',
    },
  })

  // --- FUNGSI RESET EMAIL ---
  const handleSendResetEmail = async () => {
    if (!initialData?.email) return
    setIsSendingEmail(true)
    try {
      await pb.collection('users').requestPasswordReset(initialData.email)
      toast.success(`Password reset email sent to ${initialData.email}`)
      setShowResetPassword(false)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send reset email')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const mutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const payload: any = {
        name: values.name,
        phone: values.phone,
        roleId: values.roleId,
        division: values.division,
        emailVisibility: true,
      }

      if (isEdit && initialData) {
        // UPDATE LOGIC
        if (values.password && values.password.length > 0) {
          if (!values.oldPassword) {
            throw new Error(
              'Old password is required by PocketBase to change password.'
            )
          }
          if (values.password.length < 8) {
            throw new Error('New password must be at least 8 characters')
          }
          // Masukkan oldPassword ke payload
          payload.oldPassword = values.oldPassword
          payload.password = values.password
          payload.passwordConfirm = values.passwordConfirm
        }
        return await pb.collection('users').update(initialData.id, payload)
      } else {
        // CREATE LOGIC
        payload.email = values.email.trim()
        if (!values.password || values.password.length < 8) {
          throw new Error(
            'Password is required (min 8 characters) for new users'
          )
        }
        payload.password = values.password
        payload.passwordConfirm = values.passwordConfirm
        return await pb.collection('users').create(payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-management'] })
      toast.success(
        isEdit ? 'User data updated' : 'New user created successfully'
      )
      onSuccess()
    },
    onError: (err: any) => {
      console.error('PocketBase Error:', err)
      let errorMsg = 'Failed to save user.'
      if (err?.data?.data) {
        const firstKey = Object.keys(err.data.data)[0]
        if (firstKey) {
          errorMsg = `${firstKey}: ${err.data.data[firstKey].message}`
        }
      } else if (err?.message) {
        errorMsg = err.message
      }
      toast.error(errorMsg)
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-4"
      >
        {/* --- GENERAL INFORMATION --- */}
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. John Doe"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Login ID)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@internal.rh"
                      {...field}
                      value={field.value || ''}
                      disabled={isEdit}
                      className={
                        isEdit
                          ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                          : ''
                      }
                    />
                  </FormControl>
                  {isEdit && (
                    <p className="text-[10px] text-muted-foreground">
                      Email address cannot be changed.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone / WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value || ''}
                      placeholder="0812xxxxxx"
                      type="text"
                      inputMode="numeric"
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '')
                        field.onChange(val)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="division"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Division</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Division" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="management">
                      Management / Admin
                    </SelectItem>
                    <SelectItem value="arsitektur">Architecture</SelectItem>
                    <SelectItem value="sipil">Civil (Field)</SelectItem>
                    <SelectItem value="interior">Interior</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || ''}
                  disabled={isLoadingRoles}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isLoadingRoles ? 'Loading...' : 'Select Role'
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles?.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* --- PASSWORD SECTION --- */}
        <div className="border-t pt-4 mt-4">
          {!isEdit && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <KeyRound className="h-4 w-4" /> Initial Password Setup
              </p>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Min 8 characters"
                          {...field}
                          value={field.value || ''}
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
                      <FormLabel>Confirm</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {isEdit && !showResetPassword && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-slate-700">Security</p>
              <div className="bg-slate-50 p-3 rounded border flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Password is hidden for security.
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-amber-700 border-amber-200 hover:bg-amber-50"
                  onClick={() => setShowResetPassword(true)}
                >
                  <KeyRound className="mr-2 h-3.5 w-3.5" /> Manage Password
                </Button>
              </div>
            </div>
          )}

          {isEdit && showResetPassword && (
            <div className="space-y-4 bg-amber-50/50 p-4 rounded border border-amber-200 animate-in fade-in slide-in-from-top-2">
              {/* ACTION: Manual Reset */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="oldPassword"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-amber-900">
                        Old Password <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className="bg-white"
                          placeholder="Required by system to apply changes"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-amber-900">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className="bg-white"
                          {...field}
                          value={field.value || ''}
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
                      <FormLabel className="text-amber-900">Confirm</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className="bg-white"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEdit ? 'Update User Data' : 'Create New User'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
