import { useQuery } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'

type ProjectType = 'architecture' | 'civil' | 'interior'

const INVOICE_TYPE_MAP: Record<ProjectType, string> = {
  architecture: 'design',
  civil: 'sipil',
  interior: 'interior',
}

export function useProjectInvoiceStats(projectType: ProjectType) {
  const { data, isLoading } = useQuery({
    queryKey: ['project-invoice-stats', projectType],
    queryFn: async () => {
      const records = await pb.collection('projects').getFullList({
        filter: `type = '${projectType}' && invoice_id != '' && status != 'done' && status != 'finish'`,
        expand: 'invoice_id',
        fields: 'id,invoice_id,expand.invoice_id.total_amount,expand.invoice_id.items',
      })

      let potentialRevenue = 0
      let realizationRevenue = 0

      for (const project of records) {
        const invoice = project.expand?.invoice_id
        if (!invoice) continue

        potentialRevenue += invoice.total_amount ?? 0

        const items: Array<{ amount: number; status?: string; paymentDate?: string }> =
          invoice.items ?? []

        for (const item of items) {
          if (item.status === 'Success' && item.paymentDate && item.paymentDate !== '') {
            realizationRevenue += item.amount ?? 0
          }
        }
      }

      return { potentialRevenue, realizationRevenue }
    },
  })

  return {
    potentialRevenue: data?.potentialRevenue ?? 0,
    realizationRevenue: data?.realizationRevenue ?? 0,
    isLoading,
  }
}
