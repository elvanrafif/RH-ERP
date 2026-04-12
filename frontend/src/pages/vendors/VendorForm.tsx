import { useEffect } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { vendorSchema, type VendorFormValues } from '@/lib/validations/vendor'
import type { Vendor } from '@/types'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface VendorFormProps {
  onSuccess?: () => void
  initialData?: Vendor | null
}

export function VendorForm({ onSuccess, initialData }: VendorFormProps) {
  const queryClient = useQueryClient()

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: '',
      phone: '',
      project_type: undefined,
      notes: '',
    },
  })

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        phone: initialData.phone,
        project_type: initialData.project_type,
        notes: initialData.notes ?? '',
      })
    } else {
      form.reset({ name: '', phone: '', project_type: undefined, notes: '' })
    }
  }, [initialData, form])

  const mutation = useMutation({
    mutationFn: async (values: VendorFormValues) => {
      if (initialData) {
        return await pb.collection('vendors').update(initialData.id, values)
      }
      return await pb.collection('vendors').create(values)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] })
      onSuccess?.()
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to save vendor data.'
      toast.error(message)
    },
  })

  function onSubmit(values: VendorFormValues) {
    mutation.mutate(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor / Contractor Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone / WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="0812..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="project_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="civil">Civil</SelectItem>
                    <SelectItem value="interior">Interior</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Skills, experience, or other relevant notes..."
                  className="min-h-[100px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {initialData ? 'Save Changes' : 'Add Vendor'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
