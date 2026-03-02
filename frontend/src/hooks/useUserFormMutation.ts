import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { toast } from 'sonner'
import type { User } from '@/types'
import type { UserFormValues } from '@/lib/validations/user'

interface UseUserFormMutationOptions {
  isEdit: boolean
  initialData?: User | null
  onSuccess: () => void
}

export function useUserFormMutation({
  isEdit,
  initialData,
  onSuccess,
}: UseUserFormMutationOptions) {
  const queryClient = useQueryClient()
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const handleSendResetEmail = async () => {
    if (!initialData?.email) return
    setIsSendingEmail(true)
    try {
      await pb.collection('users').requestPasswordReset(initialData.email)
      toast.success(`Password reset email sent to ${initialData.email}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email'
      toast.error(message)
    } finally {
      setIsSendingEmail(false)
    }
  }

  const mutation = useMutation({
    mutationFn: async (values: UserFormValues) => {
      const payload: Record<string, unknown> = {
        name: values.name,
        phone: values.phone,
        roleId: values.roleId,
        division: values.division,
        emailVisibility: true,
      }

      if (isEdit && initialData) {
        if (values.password && values.password.length > 0) {
          payload.oldPassword = values.oldPassword
          payload.password = values.password
          payload.passwordConfirm = values.passwordConfirm
        }
        return await pb.collection('users').update(initialData.id, payload)
      } else {
        payload.email = values.email.trim()
        payload.password = values.password
        payload.passwordConfirm = values.passwordConfirm
        return await pb.collection('users').create(payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-management'] })
      toast.success(isEdit ? 'User data updated' : 'New user created successfully')
      onSuccess()
    },
    onError: (err: unknown) => {
      let errorMsg = 'Failed to save user.'
      if (err && typeof err === 'object') {
        const pbErr = err as {
          data?: { data?: Record<string, { message: string }> }
          message?: string
        }
        if (pbErr.data?.data) {
          const firstKey = Object.keys(pbErr.data.data)[0]
          if (firstKey) errorMsg = `${firstKey}: ${pbErr.data.data[firstKey].message}`
        } else if (pbErr.message) {
          errorMsg = pbErr.message
        }
      }
      toast.error(errorMsg)
    },
  })

  return { mutation, isSendingEmail, handleSendResetEmail }
}
