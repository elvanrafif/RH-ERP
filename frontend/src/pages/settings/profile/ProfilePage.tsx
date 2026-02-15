import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { User } from '@/types'
import { Loader2, User as UserIcon, ShieldCheck } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Import Components
import { ProfileEditForm } from './components/ProfileEditForm'
import { SecurityForm } from './components/SecurityForm'
import { ProfileAvatar } from './components/ProfileAvatar' // Import Baru

export default function ProfilePage() {
  // Fetch User
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const currentId = pb.authStore.model?.id
      if (!currentId) return null
      return await pb.collection('users').getOne<User>(currentId)
    },
  })

  // Badge Helper
  const getDivisionBadge = (div?: string) => {
    switch (div) {
      case 'sipil':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'arsitektur':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'interior':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'management':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  if (isLoading || !user)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    )

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">
        Pengaturan Akun
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8">
        {/* --- SIDEBAR KIRI (PROFILE CARD) --- */}
        <div className="flex flex-col gap-4">
          <Card className="overflow-hidden">
            {/* Background Banner (Opsional, pemanis UI) */}
            <div className="h-24 bg-gradient-to-r from-slate-200 to-slate-100"></div>

            <CardContent className="pt-0 -mt-12 flex flex-col items-center text-center relative z-10">
              {/* KOMPONEN AVATAR PINTAR */}
              <ProfileAvatar user={user} className="mb-3" />

              <h2 className="font-bold text-lg mt-2">{user.name}</h2>
              <p className="text-xs text-muted-foreground mb-4 break-all">
                {user.email}
              </p>

              <div className="flex flex-wrap justify-center gap-2">
                <Badge
                  variant="outline"
                  className={`uppercase ${getDivisionBadge(user.division)}`}
                >
                  {user.division || 'Umum'}
                </Badge>
                {user.isSuperAdmin && (
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
                  >
                    Superadmin
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- MAIN CONTENT (TABS KANAN) --- */}
        <div className="flex-1">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" /> Biodata
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Password
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Dasar</CardTitle>
                  <CardDescription>
                    Kelola informasi profil dan kontak Anda.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileEditForm user={user} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Ganti Password</CardTitle>
                  <CardDescription>
                    Amankan akun Anda dengan password yang kuat.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SecurityForm user={user} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
