import type { Control } from 'react-hook-form'
import type { Invoice } from '@/types'
import { useRole } from '@/hooks/useRole'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LinkedInvoiceSelectFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  linkedInvoices: Invoice[]
}

export function LinkedInvoiceSelectField({
  control,
  linkedInvoices,
}: LinkedInvoiceSelectFieldProps) {
  const { isSuperAdmin } = useRole()
  if (!isSuperAdmin) return null

  return (
    <FormField
      control={control}
      name="invoice_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Linked Invoice</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={(field.value as string) || '__none__'}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select invoice (optional)" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {linkedInvoices.map((inv) => {
                const clientName = inv.expand?.client_id?.company_name ?? '—'
                return (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.invoice_number} — {clientName}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  )
}
