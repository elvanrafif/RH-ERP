import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { pb } from '@/lib/pocketbase'
import type { Survey } from '@/types'
import { useSurveys } from '@/hooks/useSurveys'
import { useDebounce } from '@/hooks/useDebounce'
import { usePagination } from '@/hooks/usePagination'
import { useTableState } from '@/hooks/useTableState'
import { SurveyTable } from './SurveyTable'
import { SurveyForm } from './SurveyForm'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormDialog } from '@/components/shared/FormDialog'
import { DeleteConfirmDialog } from '@/components/shared/DeleteConfirmDialog'
import { TablePagination } from '@/components/shared/TablePagination'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ClipboardList, Plus, Search } from 'lucide-react'

export default function SurveyPage() {
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<Survey | null>(null)

  const {
    open,
    setOpen,
    editing,
    searchTerm,
    setSearchTerm,
    handleCreate,
    handleEdit,
    handleCloseForm,
  } = useTableState<Survey>()

  const debouncedSearch = useDebounce(searchTerm, 300)
  const { surveys, isLoading } = useSurveys({ searchTerm: debouncedSearch })
  const { page, setPage, totalItems, totalPages, paginatedData } = usePagination(
    surveys,
    [debouncedSearch]
  )

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
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> New Survey
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden relative bg-card/50 rounded-lg border border-border shadow-inner flex flex-col">
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-white/80 backdrop-blur-sm shrink-0">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search client..."
              className="pl-9 h-9 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <SurveyTable
          surveys={paginatedData}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={setDeleteTarget}
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
        />
      </FormDialog>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null) }}
        title="Delete Survey"
        description="This action cannot be undone."
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
