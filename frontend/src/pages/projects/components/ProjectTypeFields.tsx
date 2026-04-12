import type { Control } from 'react-hook-form'
import type { User, Vendor } from '@/types'
import { Input } from '@/components/ui/input'
import {
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
import type { ProjectFormValues } from '@/lib/validations/project'

interface ProjectTypeFieldsProps {
  control: Control<ProjectFormValues>
  isCivil: boolean
  isArchitecture: boolean
  isInterior: boolean
  isSuperAdmin: boolean
  user: User | null | undefined
  users: User[] | undefined
  civilVendors: Vendor[]
  interiorVendors: Vendor[]
  fixedType: string
  displayValue: string
  onRupiahChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    onChange: (val: number) => void
  ) => void
}

export function ProjectTypeFields({
  control,
  isCivil,
  isArchitecture,
  isInterior,
  isSuperAdmin,
  user,
  users,
  civilVendors,
  interiorVendors,
  fixedType,
  displayValue,
  onRupiahChange,
}: ProjectTypeFieldsProps) {
  return (
    <>
      {/* SIPIL: contract dates */}
      {isCivil && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
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
            control={control}
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

      {/* ARSITEKTUR & SIPIL: land/building area */}
      {(isArchitecture || isCivil) && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
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
            control={control}
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

      {/* INTERIOR: work scope + vendor */}
      {isInterior && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
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
          <FormField
            control={control}
            name="pic_interior"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interior Vendor / Contractor</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value as string}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vendor..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {interiorVendors.map((v) => (
                      <SelectItem key={v.id} value={v.name}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
      )}

      {/* PIC + DEADLINE + CONTRACT VALUE */}
      <div className="grid grid-cols-2 gap-4">
        {!isCivil && (
          <FormField
            control={control}
            name="assignee"
            render={({ field }) => {
              const availableUsers =
                users?.filter((u) => u.division?.toLowerCase() === fixedType) ||
                []
              if (
                !isSuperAdmin &&
                !availableUsers.find((u) => u.id === user?.id) &&
                user
              ) {
                availableUsers.push(user)
              }
              return (
                <FormItem>
                  <FormLabel>
                    {isArchitecture ? 'PIC Design / Drafter' : 'Interior PIC'}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value as string}
                    disabled={!isSuperAdmin}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select PIC" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isSuperAdmin && (
                        <SelectItem value="unassigned">
                          -- Unassigned --
                        </SelectItem>
                      )}
                      {availableUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name || u.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )
            }}
          />
        )}

        {isCivil && (
          <FormField
            control={control}
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
                    {civilVendors.map((v) => (
                      <SelectItem key={v.id} value={v.name}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}

        {!isCivil && (
          <FormField
            control={control}
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

        <div className="grid gap-4">
          {isSuperAdmin && (
            <FormField
              control={control}
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
                        onChange={(e) => onRupiahChange(e, field.onChange)}
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
    </>
  )
}
