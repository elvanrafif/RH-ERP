import { UsersRound } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { ClientTrackingTab } from '@/components/dashboard/tabs/ClientTrackingTab'

export default function ClientTrackingPage() {
  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col gap-6 overflow-y-auto bg-background/50">
      <PageHeader
        icon={<UsersRound className="w-6 h-6" />}
        title="Client Tracking"
        description="Project list per client, grouped by semester."
      />
      <ClientTrackingTab />
    </div>
  )
}
