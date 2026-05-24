import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { toast } from 'sonner'
import type { User } from '@/types'

export function useProfile() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: () => {
      const currentId = pb.authStore.model?.id
      if (!currentId) return null
      return pb.collection('users').getOne<User>(currentId, { expand: 'roleId' })
    },
  })

  return { user, isLoading }
}

export function useUpdateProfile(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (values: { name: string; phone?: string }) =>
      pb.collection('users').update(userId, values),
    onSuccess: (data) => {
      pb.authStore.save(pb.authStore.token, data)
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('Profile updated successfully')
    },
    onError: () => toast.error('Failed to update profile'),
  })
}

export function useChangePassword(userId: string) {
  return useMutation({
    mutationFn: (values: {
      oldPassword: string
      password: string
      passwordConfirm: string
    }) => pb.collection('users').update(userId, values),
  })
}

export function useAvatarMutation(userId: string) {
  const queryClient = useQueryClient()

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)
      return pb.collection('users').update(userId, formData)
    },
    onSuccess: (data) => {
      pb.authStore.save(pb.authStore.token, data)
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('Profile photo updated')
    },
    onError: () => toast.error('Failed to upload photo'),
  })

  const remove = useMutation({
    mutationFn: () => pb.collection('users').update(userId, { avatar: null }),
    onSuccess: (data) => {
      pb.authStore.save(pb.authStore.token, data)
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('Profile photo removed')
    },
    onError: () => toast.error('Failed to remove photo'),
  })

  return { upload, remove, isLoading: upload.isPending || remove.isPending }
}
