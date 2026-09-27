import { useMemo, useState } from 'react'
import { ArrowLeft, Download, LockKeyhole, Pencil, Plus, UnlockKeyhole } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useDeletePettyCashEntry, usePettyCashDetail } from '@/hooks/usePettyCash'
import { calculatePettyCashBalance } from '@/lib/pettyCash/balance'
import { exportPettyCashReport } from '@/lib/pettyCash/report'
import type { PettyCashEntry, PettyCashEntryType } from '@/types/pettyCash'
import { PettyCashEntryDialog } from './components/PettyCashEntryDialog'
import { PettyCashEntryTable } from './components/PettyCashEntryTable'
import { PettyCashStatusDialog } from './components/PettyCashStatusDialog'
import { PettyCashSummary } from './components/PettyCashSummary'
import { ReceiptPreviewDialog } from './components/ReceiptPreviewDialog'
import { EditPettyCashNameDialog } from './components/EditPettyCashNameDialog'

export default function PettyCashDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const { period, entries } = usePettyCashDetail(id)
  const [entryType, setEntryType] = useState<PettyCashEntryType | null>(null)
  const [statusOpen, setStatusOpen] = useState(false)
  const [editNameOpen, setEditNameOpen] = useState(false)
  const [previewEntry, setPreviewEntry] = useState<PettyCashEntry | null>(null)
  const [editingEntry, setEditingEntry] = useState<PettyCashEntry | null>(null)
  const [deletingEntry, setDeletingEntry] = useState<PettyCashEntry | null>(null)
  const deleteMutation = useDeletePettyCashEntry()
  const balance = useMemo(() => calculatePettyCashBalance(period.data?.initial_balance ?? 0, entries.data ?? []), [period.data, entries.data])

  const exportReport = async () => {
    if (!period.data) return
    try {
      await exportPettyCashReport(period.data, entries.data ?? [], balance)
      toast.success('Report exported')
    } catch {
      toast.error('Failed to export report')
    }
  }

  if (period.isLoading) return <div className="space-y-4 p-4 md:p-8"><Skeleton className="h-12 w-64" /><Skeleton className="h-28 w-full" /><Skeleton className="h-64 w-full" /></div>
  if (period.isError || !period.data) return <div className="p-8"><p className="text-destructive">Unable to load petty cash period.</p><Button className="mt-4" variant="outline" onClick={() => navigate('/petty-cash')}>Back to Petty Cash</Button></div>

  const pettyCash = period.data
  const isOpen = pettyCash.status === 'open'

  return (
    <div className="space-y-6 p-4 md:p-8">
      <PageHeader
        icon={<Button variant="ghost" size="icon" aria-label="Back to petty cash" onClick={() => navigate('/petty-cash')}><ArrowLeft className="h-4 w-4" /></Button>}
        title={<span className="flex items-center gap-2">{pettyCash.name}{isOpen && <Button variant="ghost" size="icon" aria-label="Edit petty cash name" onClick={() => setEditNameOpen(true)}><Pencil className="h-4 w-4" /></Button>}</span>}
        description={`Created ${new Date(pettyCash.created).toLocaleDateString('id-ID')}`}
        action={<div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => void exportReport()}><Download className="mr-2 h-4 w-4" />Export Report</Button><Button variant={isOpen ? 'outline' : 'default'} onClick={() => setStatusOpen(true)}>{isOpen ? <LockKeyhole className="mr-2 h-4 w-4" /> : <UnlockKeyhole className="mr-2 h-4 w-4" />}{isOpen ? 'Close Petty Cash' : 'Reopen Petty Cash'}</Button></div>}
      />
      <PettyCashSummary period={pettyCash} balance={balance} />
      {isOpen && <div className="flex gap-2"><Button onClick={() => setEntryType('expense')}><Plus className="mr-2 h-4 w-4" />Add Expense</Button><Button variant="outline" onClick={() => setEntryType('topup')}><Plus className="mr-2 h-4 w-4" />Top Up</Button></div>}
      <PettyCashEntryTable entries={entries.data ?? []} isLoading={entries.isLoading} onPreview={setPreviewEntry} canEdit={isOpen} onEdit={setEditingEntry} onDelete={setDeletingEntry} />
      {entries.isError && <p role="alert" className="text-sm text-destructive">Unable to load transactions.</p>}
      {entryType && <PettyCashEntryDialog open={!!entryType} onOpenChange={(open) => { if (!open) setEntryType(null) }} pettyCashId={pettyCash.id} type={entryType} remainingBalance={balance.balance} />}
      {editingEntry && <PettyCashEntryDialog key={editingEntry.id} open onOpenChange={(open) => { if (!open) setEditingEntry(null) }} pettyCashId={pettyCash.id} type={editingEntry.type} remainingBalance={balance.balance} entry={editingEntry} />}
      <PettyCashStatusDialog period={pettyCash} open={statusOpen} onOpenChange={setStatusOpen} />
      <EditPettyCashNameDialog period={pettyCash} open={editNameOpen} onOpenChange={setEditNameOpen} />
      {previewEntry && <ReceiptPreviewDialog key={previewEntry.id} entry={previewEntry} open onOpenChange={(open) => { if (!open) setPreviewEntry(null) }} />}
      <AlertDialog open={!!deletingEntry} onOpenChange={(open) => { if (!open) setDeletingEntry(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete transaction?</AlertDialogTitle><AlertDialogDescription>This transaction will be permanently removed.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleteMutation.isPending} onClick={(event) => { event.preventDefault(); if (deletingEntry) void deleteMutation.mutateAsync({ id: deletingEntry.id, pettyCashId: pettyCash.id }).then(() => { toast.success('Transaction deleted'); setDeletingEntry(null) }).catch(() => toast.error('Failed to delete transaction')) }}>Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
