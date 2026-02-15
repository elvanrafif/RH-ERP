import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '@/lib/pocketbase'
import { cn } from '@/lib/utils'
import { z } from 'zod'
import type { Project, Client, User } from '@/types'
import { toast } from 'sonner'

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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Loader2, Check, ChevronsUpDown } from 'lucide-react'
import { formatRupiahDisplay } from '@/lib/helpers'
import { SipilPic } from '@/lib/constant'

// --- SCHEMA ---
const projectSchema = z.object({
  client_id: z.string().min(1, 'Please select a client'),
  assignee: z.string().optional(),
  status: z.string(),
  // UPDATE: Renamed 'value' to 'contract_value'
  contract_value: z.coerce.number().min(0).optional(),
  deadline: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),

  // Meta Data Inputs
  luas_tanah: z.coerce.number().optional(),
  luas_bangunan: z.coerce.number().optional(),
  pic_lapangan: z.string().optional(),
  pic_interior: z.string().optional(),
  area_scope: z.string().optional(),
  notes: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormProps {
  onSuccess?: () => void
  initialData?: Project | null
  fixedType: 'arsitektur' | 'sipil' | 'interior'
  statusOptions: { value: string; label: string }[]
}

export function ProjectForm({
  onSuccess,
  initialData,
  fixedType,
  statusOptions,
}: ProjectFormProps) {
  const queryClient = useQueryClient()
  const user = pb.authStore.model
  const isSuperAdmin =
    user?.isSuperAdmin || user?.email === 'elvanrafif@gmail.com'
  const isInterior = fixedType === 'interior'
  const isArsitektur = fixedType === 'arsitektur'
  const isSipil = fixedType === 'sipil'

  // FETCH RELATIONS
  const { data: clients } = useQuery({
    queryKey: ['clients-list'],
    queryFn: async () =>
      await pb
        .collection('clients')
        .getFullList<Client>({ sort: 'company_name' }),
  })
  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => await pb.collection('users').getFullList<User>(),
  })

  // STATES
  const [displayValue, setDisplayValue] = useState('')
  const [openClient, setOpenClient] = useState(false)

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      client_id: initialData?.client || '',
      assignee: initialData?.assignee || '',
      status: initialData?.status || statusOptions[0]?.value || '',
      // UPDATE: Mapping to contract_value
      contract_value: initialData?.contract_value || 0,
      deadline: initialData?.deadline
        ? initialData.deadline.substring(0, 10)
        : '',
      start_date: initialData?.start_date
        ? initialData.start_date.substring(0, 10)
        : '',
      end_date: initialData?.end_date
        ? initialData.end_date.substring(0, 10)
        : '',

      // Load Meta Data
      luas_tanah: initialData?.meta_data?.luas_tanah || 0,
      luas_bangunan: initialData?.meta_data?.luas_bangunan || 0,
      pic_lapangan: initialData?.meta_data?.pic_lapangan || '',
      pic_interior: initialData?.meta_data?.pic_interior || '',
      area_scope: initialData?.meta_data?.area_scope || '',
      notes: initialData?.meta_data?.notes || '',
    },
  })

  // UPDATE: Init display value from contract_value
  useEffect(() => {
    if (initialData?.contract_value)
      setDisplayValue(formatRupiahDisplay(initialData.contract_value))
  }, [initialData])

  const mutation = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      const meta_data = {
        luas_tanah: values.luas_tanah,
        luas_bangunan: values.luas_bangunan,
        pic_lapangan: values.pic_lapangan,
        pic_interior: values.pic_interior,
        area_scope: values.area_scope,
        notes: values.notes,
      }

      const cleanValues = {
        client: values.client_id,
        assignee: values.assignee || null,
        status: values.status,
        type: fixedType,
        // UPDATE: Send contract_value to DB
        contract_value: values.contract_value,
        deadline: values.deadline || null,
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        meta_data: meta_data,
      }

      if (initialData) {
        return await pb
          .collection('projects')
          .update(initialData.id, cleanValues)
      } else {
        return await pb.collection('projects').create(cleanValues)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success(
        initialData
          ? 'Project updated successfully'
          : 'Project created successfully'
      )
      onSuccess?.()
    },
    onError: (err) => {
      console.error(err)
      toast.error('Failed to save project')
    },
  })

  const handleRupiahChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (val: number) => void
  ) => {
    const rawValue = e.target.value.replace(/\./g, '')
    const numericValue = parseInt(rawValue) || 0
    setDisplayValue(formatRupiahDisplay(rawValue))
    onChange(numericValue)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        className="space-y-4"
      >
        {/* ROW 1: CLIENT & STATUS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SEARCHABLE CLIENT COMBOBOX */}
          <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Client / Project Name</FormLabel>
                <Popover open={openClient} onOpenChange={setOpenClient}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openClient}
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value
                          ? clients?.find((client) => client.id === field.value)
                              ?.company_name
                          : 'Search & Select Client...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Type client name..." />
                      <CommandList>
                        <CommandEmpty>No client found.</CommandEmpty>
                        <CommandGroup>
                          {clients?.map((client) => (
                            <CommandItem
                              value={client.company_name}
                              key={client.id}
                              onSelect={() => {
                                form.setValue('client_id', client.id)
                                setOpenClient(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  client.id === field.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              {client.company_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status / Stage</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value as string}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* INPUT KHUSUS: SIPIL (DURASI KONTRAK) */}
        {isSipil && (
          <div className="grid grid-cols-2 gap-4 ">
            <FormField
              control={form.control}
              name="start_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Start</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ''}
                      className="block w-full bg-white [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract End</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ''}
                      className="block w-full bg-white [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        {/* INPUT KHUSUS: ARSITEKTUR & SIPIL (LT/LB) */}
        {(isArsitektur || isSipil) && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="luas_tanah"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Land Area (m²)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value ? String(field.value) : ''}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="luas_bangunan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Building Area (m²)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value ? String(field.value) : ''}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        {/* INPUT KHUSUS: INTERIOR (SCOPE) */}
        {isInterior && (
          <div className="bg-emerald-50 p-3 rounded border border-emerald-100">
            <FormField
              control={form.control}
              name="area_scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Area / Scope (e.g. Kitchen Set & Master Bed)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Type work scope..."
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}

        {/* PIC SELECTION */}
        <div className="grid grid-cols-2 gap-4">
          {!isSipil && (
            <FormField
              control={form.control}
              name="assignee"
              render={({ field }) => {
                // FILTER DINAMIS: Ambil user yang divisinya sesuai dengan fixedType (arsitektur/interior)
                // (Menggunakan .toLowerCase() agar lebih aman dari typo kapital)
                const availableUsers =
                  users?.filter(
                    (u: any) =>
                      u.divisi?.toLowerCase() === fixedType ||
                      u.division?.toLowerCase() === fixedType
                  ) || []

                return (
                  <FormItem>
                    <FormLabel>
                      {isArsitektur ? 'PIC Design / Drafter' : 'Interior PIC'}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value as string}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select PIC" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="unassigned">
                          -- Unassigned --
                        </SelectItem>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )
              }}
            />
          )}

          {isSipil && (
            <FormField
              control={form.control}
              name="pic_lapangan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Field PIC</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value as string}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Supervisor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SipilPic.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          )}

          {!isSipil && (
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Deadline</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value || ''}
                      className="block w-full bg-white [&::-webkit-calendar-picker-indicator]:ml-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div className="grid  gap-4 ">
            {isSuperAdmin && (
              <FormField
                control={form.control}
                name="contract_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Value (Rp)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-sm text-gray-500 font-semibold">
                          Rp
                        </span>
                        <Input
                          type="text"
                          className="pl-9 font-medium bg-white"
                          placeholder="0"
                          value={displayValue}
                          onChange={(e) =>
                            handleRupiahChange(e, field.onChange)
                          }
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* CONTRACT VALUE (MONEY & TIME) */}

        {/* NOTES */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={4} {...field} value={field.value || ''} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Project
          </Button>
        </div>
      </form>
    </Form>
  )
}
