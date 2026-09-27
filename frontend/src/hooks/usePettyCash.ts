import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { PETTY_CASH_COLLECTION } from '@/lib/constant'
import type {
  CreatePettyCashInput,
  PettyCash,
  PettyCashEntry,
  PettyCashEntryInput,
  PettyCashStatus,
} from '@/types/pettyCash'

export function usePettyCashList() {
  return useQuery({
    queryKey: ['petty-cash'],
    queryFn: () =>
      pb.collection(PETTY_CASH_COLLECTION.PERIOD).getFullList<PettyCash>({
        sort: '-created',
      }),
  })
}

export function usePettyCashEntryLists(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['petty-cash', id, 'entries'],
      queryFn: () =>
        pb.collection(PETTY_CASH_COLLECTION.ENTRY).getFullList<PettyCashEntry>({
          filter: `petty_cash_id = "${id}"`,
          sort: 'transaction_date,created',
        }),
    })),
  })
}

export function usePettyCashDetail(id: string) {
  const period = useQuery({
    queryKey: ['petty-cash', id],
    queryFn: () =>
      pb.collection(PETTY_CASH_COLLECTION.PERIOD).getOne<PettyCash>(id),
    enabled: !!id,
  })

  const entries = useQuery({
    queryKey: ['petty-cash', id, 'entries'],
    queryFn: () =>
      pb.collection(PETTY_CASH_COLLECTION.ENTRY).getFullList<PettyCashEntry>({
        filter: `petty_cash_id = "${id}"`,
        sort: 'transaction_date,created',
      }),
    enabled: !!id,
  })

  return { period, entries }
}

export function useCreatePettyCash() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreatePettyCashInput) =>
      pb.collection(PETTY_CASH_COLLECTION.PERIOD).create<PettyCash>({
        ...input,
        status: 'open',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['petty-cash'] }),
  })
}

export function useUpdatePettyCashStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PettyCashStatus }) =>
      pb.collection(PETTY_CASH_COLLECTION.PERIOD).update<PettyCash>(id, { status }),
    onSuccess: (_record, variables) =>
      queryClient.invalidateQueries({ queryKey: ['petty-cash', variables.id] }),
  })
}

export function useUpdatePettyCashName() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      pb.collection(PETTY_CASH_COLLECTION.PERIOD).update<PettyCash>(id, { name }),
    onSuccess: (_record, variables) => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] })
    },
  })
}

export function useCreatePettyCashEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: PettyCashEntryInput) => {
      const formData = new FormData()
      formData.append('petty_cash_id', input.petty_cash_id)
      formData.append('type', input.type)
      formData.append('transaction_date', input.transaction_date)
      formData.append('amount', String(input.amount))
      if (input.person_name) formData.append('person_name', input.person_name)
      if (input.purpose) formData.append('purpose', input.purpose)
      if (input.notes) formData.append('notes', input.notes)
      if (input.receipt) formData.append('receipt', input.receipt)
      return pb.collection(PETTY_CASH_COLLECTION.ENTRY).create<PettyCashEntry>(formData)
    },
    onSuccess: (_record, input) => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash', input.petty_cash_id] })
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] })
    },
  })
}

export function useUpdatePettyCashEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PettyCashEntryInput }) => {
      const formData = new FormData()
      formData.append('type', input.type)
      formData.append('transaction_date', input.transaction_date)
      formData.append('amount', String(input.amount))
      formData.append('person_name', input.person_name ?? '')
      formData.append('purpose', input.purpose ?? '')
      formData.append('notes', input.notes ?? '')
      if (input.receipt) formData.append('receipt', input.receipt)
      return pb.collection(PETTY_CASH_COLLECTION.ENTRY).update<PettyCashEntry>(id, formData)
    },
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash', record.petty_cash_id] })
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] })
    },
  })
}

export function useDeletePettyCashEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; pettyCashId: string }) =>
      pb.collection(PETTY_CASH_COLLECTION.ENTRY).delete(id),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['petty-cash', variables.pettyCashId] })
      queryClient.invalidateQueries({ queryKey: ['petty-cash'] })
    },
  })
}
