import { useMemo, useState } from 'react'
import { Plus, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/shared/PageHeader'
import { usePettyCashList } from '@/hooks/usePettyCash'
import { usePettyCashEntryLists } from '@/hooks/usePettyCash'
import { calculatePettyCashBalance } from '@/lib/pettyCash/balance'
import { CreatePettyCashDialog } from './components/CreatePettyCashDialog'
import { PettyCashTable } from './components/PettyCashTable'

export default function PettyCashPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: periods = [], isLoading } = usePettyCashList()
  const entryQueries = usePettyCashEntryLists(periods.map((period) => period.id))
  const balances = useMemo(() => Object.fromEntries(periods.map((period, index) => [
    period.id,
    calculatePettyCashBalance(period.initial_balance, entryQueries[index]?.data ?? []),
  ])), [periods, entryQueries])

  return (
    <div className="flex h-full flex-col p-4 md:p-8">
      <PageHeader
        icon={<Wallet className="h-6 w-6 text-primary" />}
        title="Petty Cash"
        description="Track petty cash periods, expenses, and top-ups."
        action={<Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />Create Petty Cash</Button>}
      />
      <PettyCashTable periods={periods} balances={balances} isLoading={isLoading || entryQueries.some((query) => query.isLoading)} />
      <CreatePettyCashDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
