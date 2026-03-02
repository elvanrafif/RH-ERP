import type { Control } from 'react-hook-form'
import type { UserFormValues } from '@/lib/validations/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Loader2, KeyRound, Mail } from 'lucide-react'

interface PasswordSectionProps {
  control: Control<UserFormValues>
  isEdit: boolean
  showResetPassword: boolean
  setShowResetPassword: (show: boolean) => void
  isSendingEmail: boolean
  onSendResetEmail: () => void
}

export function PasswordSection({
  control,
  isEdit,
  showResetPassword,
  setShowResetPassword,
  isSendingEmail,
  onSendResetEmail,
}: PasswordSectionProps) {
  return (
    <div className="border-t pt-4 mt-4">
      {!isEdit && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> Initial Password Setup
          </p>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
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
              control={control}
              name="passwordConfirm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} value={field.value || ''} />
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
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
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
              control={control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-amber-900">New Password</FormLabel>
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
              control={control}
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

          <div className="flex items-center gap-2 pt-2 border-t border-amber-200">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSendResetEmail}
              disabled={isSendingEmail}
              className="text-blue-700 border-blue-200 hover:bg-blue-50"
            >
              {isSendingEmail ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Mail className="mr-2 h-3.5 w-3.5" />
              )}
              Send Reset Email
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
