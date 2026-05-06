import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { pb } from '@/lib/pocketbase'
import type { Survey } from '@/types'
import { useSurveys } from '@/hooks/useSurveys'
import { useUsers } from '@/hooks/useUsers'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagination } from '@/hooks/usePagination'
import { useTableState } from '@/hooks/useTableState'
import { SurveyTable } from './SurveyTable'
import { SurveyForm } from './SurveyForm'
import { SurveyDetailDialog } from './SurveyDetailDialog'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { TablePagination } from '@/components/shared/TablePagination'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ClipboardList, Plus, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function SurveyPage() {
  const { can } = useAuth()
  const canManage = can('manage_surveys')
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<Survey | null>(null)
  const [filterPic, setFilterPic] = useState('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'done'>(
    'all'
  )

  const {
    open,
    setOpen,
    editing,
    viewing,
    searchTerm,
    setSearchTerm,
    handleCreate,
    handleEdit,
    handleView,
    handleCloseForm,
    handleCloseDetail,
  } = useTableState<Survey>()

  const debouncedSearch = useDebounce(searchTerm, 300)
  const { surveys, isLoading } = useSurveys({
    searchTerm: debouncedSearch,
    filterPic,
    filterStatus,
  })
  const { users } = useUsers()
  const { page, setPage, totalItems, totalPages, paginatedData } =
    usePagination(surveys, [debouncedSearch, filterPic, filterStatus])

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pb.collection('surveys').delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] })
      toast.success('Survey appointment deleted')
      setDeleteTarget(null)
    },
    onError: () => toast.error('Failed to delete survey'),
  })

  return (
    <div className="flex-1 h-full p-4 md:p-8 pt-6 flex flex-col overflow-hidden bg-background/50">
      <PageHeader
        icon={<ClipboardList className="h-6 w-6 text-slate-800" />}
        title="Survey & Measurement"
        description="Manage survey and measurement appointments"
        action={
          canManage ? (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" /> New Survey
            </Button>
          ) : undefined
        }
      />

      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0 flex-wrap">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search client..."
              className="pl-9 h-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative">
            <Select value={filterPic} onValueChange={setFilterPic}>
              <SelectTrigger
                className={`h-9 bg-white shadow-sm w-[160px] ${filterPic !== 'all' ? 'border-primary/50 ring-1 ring-primary/30 text-primary' : ''}`}
              >
                <SelectValue placeholder="PIC" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All PIC</SelectItem>
                {(users ?? []).map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterPic !== 'all' && (
              <span className="absolute -top-1 -right-1 z-10 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
            )}
          </div>

          <div className="relative">
            <Select
              value={filterStatus}
              onValueChange={(v) =>
                setFilterStatus(v as 'all' | 'pending' | 'done')
              }
            >
              <SelectTrigger
                className={`h-9 bg-white shadow-sm w-[140px] ${filterStatus !== 'all' ? 'border-primary/50 ring-1 ring-primary/30 text-primary' : ''}`}
              >
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            {filterStatus !== 'all' && (
              <span className="absolute -top-1 -right-1 z-10 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
            )}
          </div>
        </div>

        <SurveyTable
          surveys={paginatedData}
          isLoading={isLoading}
          onView={handleView}
          onEdit={canManage ? handleEdit : undefined}
          onDelete={canManage ? setDeleteTarget : undefined}
        />
        <TablePagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemCount={paginatedData.length}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </div>

      <SurveyDetailDialog
        survey={viewing}
        open={!!viewing}
        onOpenChange={(v) => {
          if (!v) handleCloseDetail()
        }}
      />

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? 'Edit Survey Appointment' : 'New Survey Appointment'}
        description={
          editing
            ? 'Update the survey appointment details.'
            : 'Fill in the details to schedule a new survey.'
        }
      >
        <SurveyForm
          key={editing ? editing.id : 'new-survey'}
          initialData={editing}
          onSuccess={handleCloseForm}
          users={users ?? []}
        />
      </FormDialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null)
        }}
        title="Delete Survey"
        description="This action cannot be undone."
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
