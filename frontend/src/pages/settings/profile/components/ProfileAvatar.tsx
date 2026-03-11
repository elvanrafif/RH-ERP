import { useState, useRef } from 'react'
import { MAX_AVATAR_SIZE_BYTES } from '@/lib/constant'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { User } from '@/types'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import {
  Loader2,
  Camera,
  Trash2,
  Eye,
  UploadCloud,
} from 'lucide-react'

interface ProfileAvatarProps {
  user: User
  className?: string
}

export function ProfileAvatar({ user, className }: ProfileAvatarProps) {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  const getInitials = (name?: string) =>
    name ? name.substring(0, 2).toUpperCase() : '??'
  const avatarUrl = user.avatar ? pb.files.getUrl(user, user.avatar) : null

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)
      return await pb.collection('users').update(user.id, formData)
    },
    onSuccess: (data) => {
      pb.authStore.save(pb.authStore.token, data)
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('Profile photo updated')
    },
    onError: () => toast.error('Failed to upload photo'),
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await pb.collection('users').update(user.id, { avatar: null })
    },
    onSuccess: (data) => {
      pb.authStore.save(pb.authStore.token, data)
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('Profile photo removed')
      setIsPreviewOpen(false)
      setIsDeleteConfirmOpen(false)
    },
    onError: () => toast.error('Failed to remove photo'),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > MAX_AVATAR_SIZE_BYTES) {
        toast.error('File too large (max 5MB)')
        return
      }
      uploadMutation.mutate(file)
    }
  }

  const triggerUpload = () => fileInputRef.current?.click()
  const isLoading = uploadMutation.isPending || deleteMutation.isPending

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* AVATAR */}
      <div className="relative group">
        <Avatar
          className="h-32 w-32 border-4 border-white shadow-sm cursor-pointer"
          onClick={() => setIsPreviewOpen(true)}
        >
          <AvatarImage src={avatarUrl || ''} className="object-cover" />
          <AvatarFallback className="text-4xl bg-slate-100 text-slate-400">
            {getInitials(user.name)}
          </AvatarFallback>

          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full z-20">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}

          {!isLoading && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
              <Eye className="h-6 w-6 text-white mb-1" />
              <span className="text-[10px] text-white font-medium">View</span>
            </div>
          )}
        </Avatar>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="secondary"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md border border-white hover:bg-slate-100 z-20"
            >
              <Camera className="h-4 w-4 text-slate-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsPreviewOpen(true)}>
              <Eye className="mr-2 h-4 w-4" /> View Photo
            </DropdownMenuItem>
            <DropdownMenuItem onClick={triggerUpload}>
              <UploadCloud className="mr-2 h-4 w-4" /> Change Photo
            </DropdownMenuItem>
            {user.avatar && (
              <DropdownMenuItem
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Remove Photo
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg"
        onChange={handleFileChange}
      />

      {/* PREVIEW DIALOG */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="md:max-w-md bg-transparent border-none shadow-none p-0 flex flex-col items-center justify-center">
          <div className="relative rounded-lg overflow-hidden shadow-2xl bg-black">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile photo"
                className="max-h-[80vh] w-auto object-contain"
              />
            ) : (
              <div className="h-64 w-64 flex items-center justify-center bg-slate-800 text-slate-400">
                <span className="text-sm">No photo</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="secondary"
              onClick={triggerUpload}
              disabled={isLoading}
            >
              <Camera className="mr-2 h-4 w-4" /> Change Photo
            </Button>
            {user.avatar && (
              <Button
                variant="destructive"
                onClick={() => setIsDeleteConfirmOpen(true)}
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Remove
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM */}
      <DeleteConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Remove Profile Photo?"
        description="This action cannot be undone."
        onConfirm={() => deleteMutation.mutate()}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
