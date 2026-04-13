import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { User } from '@/types'
import { useRoles } from '@/hooks/useRoles'
import { userFormSchema } from '@/lib/validations/user'
import type { UserFormValues } from '@/lib/validations/user'
import { useUserFormMutation } from '@/hooks/useUserFormMutation'
import { PasswordSection } from './PasswordSection'

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
import { Loader2 } from 'lucide-react'

interface UserFormProps {
  initialData?: User | null
  onSuccess: () => void
}

export function UserForm({ initialData, onSuccess }: UserFormProps) {
  const isEdit = !!initialData
  const [showResetPassword, setShowResetPassword] = useState(false)

  const { roles, isLoading: isLoadingRoles } = useRoles()
  const { mutation, isSendingEmail, handleSendResetEmail } =
    useUserFormMutation({
      isEdit,
      initialData,
      onSuccess,
    })

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      roleId: initialData?.roleId || '',
      division: initialData?.division || '',
      oldPassword: '',
      password: '',
      passwordConfirm: '',
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-4"
      >
        {/* GENERAL INFORMATION */}
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
                      onChange={(e) =>
                        field.onChange(e.target.value.replace(/\D/g, ''))
                      }
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
                    <SelectItem value="socmed">Social Media</SelectItem>
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
                    {roles.map((r) => (
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

        <PasswordSection
          control={form.control}
          isEdit={isEdit}
          showResetPassword={showResetPassword}
          setShowResetPassword={setShowResetPassword}
          isSendingEmail={isSendingEmail}
          onSendResetEmail={handleSendResetEmail}
        />

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
