import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import type { User } from '@/types'
import {
  Loader2,
  User as UserIcon,
  ShieldCheck,
  Mail,
  Building2,
  Phone,
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Import Components
import { ProfileEditForm } from './components/ProfileEditForm'
import { SecurityForm } from './components/SecurityForm'
import { ProfileAvatar } from './components/ProfileAvatar'
import { MaskingTextByDivision } from '@/lib/masking'

export default function ProfilePage() {
  // State untuk Custom Vertical Tabs
  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general')

  // Fetch User
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const currentId = pb.authStore.model?.id
      if (!currentId) return null
      return await pb.collection('users').getOne<User>(currentId, {
        expand: 'roleId', // Ambil nama role juga jika diperlukan
      })
    },
  })

  // Badge Helper
  const getDivisionBadge = (div?: string) => {
    switch (div?.toLowerCase()) {
      case 'civil':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'architecture':
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
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Account Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings and set e-mail preferences.
        </p>
      </div>

      <Card className="flex-1 flex flex-col md:flex-row overflow-hidden border-slate-200/60 shadow-sm bg-white">
        {/* --- LEFT SIDEBAR (VERTICAL NAVIGATION & BRIEF INFO) --- */}
        <div className="w-full md:w-[280px] bg-slate-50/50 flex flex-col border-r border-slate-100">
          {/* Quick Profile Snippet */}
          <div className="p-6 flex flex-col items-center text-center border-b border-slate-100">
            <ProfileAvatar user={user} className="h-20 w-20 mb-4 shadow-sm" />
            <h2 className="font-semibold text-slate-900 leading-tight">
              {user.name}
            </h2>

            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              <Badge
                variant="outline"
                className={`uppercase text-[10px] mt-4 ${getDivisionBadge(MaskingTextByDivision(user.division))}`}
              >
                {MaskingTextByDivision(user.division) || 'General'}
              </Badge>
              {user.isSuperAdmin && (
                <Badge
                  variant="secondary"
                  className="bg-indigo-100 text-indigo-700 text-[10px] uppercase"
                >
                  Superadmin
                </Badge>
              )}
            </div>
          </div>

          {/* Vertical Menu */}
          <nav className="p-3 space-y-1 flex-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'general'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <UserIcon className="h-4 w-4" />
              Personal Info
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              Security
            </button>
          </nav>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Header Area Inside Content */}
          <div className="p-6 md:p-8 pb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {activeTab === 'general'
                ? 'Basic Information'
                : 'Change Password'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {activeTab === 'general'
                ? 'Update your personal details and contact information here.'
                : 'Ensure your account is using a long, random password to stay secure.'}
            </p>
          </div>

          <Separator className="bg-slate-100" />

          {/* Form Area Container */}
          <div className="p-6 md:p-8 flex-1 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="max-w-xl">
                {/* Read-only Data Display (Optional, untuk memperkaya UI) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> Email Account
                    </p>
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Building2 className="h-3 w-3" /> Division
                    </p>
                    <p className="text-sm font-medium text-slate-700 capitalize">
                      {MaskingTextByDivision(user.division) || 'Not assigned'}
                    </p>
                  </div>
                </div>

                {/* Form Component */}
                <ProfileEditForm user={user} />
              </div>
            )}

            {activeTab === 'security' && (
              <div className="max-w-md">
                <SecurityForm user={user} />
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
