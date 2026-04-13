import type { Control } from 'react-hook-form'
import type { User, Vendor } from '@/types'
import { PROJECT_TYPE_TO_DIVISION } from '@/lib/constant'
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
import { NumberInput } from '@/components/shared/NumberInput'

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
                  <NumberInput
                    value={field.value ?? 0}
                    onChange={field.onChange}
                    step={1}
                    min={0}
                    placeholder="0"
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
                  <NumberInput
                    value={field.value ?? 0}
                    onChange={field.onChange}
                    step={1}
                    min={0}
                    placeholder="0"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      )}

      {/* INTERIOR layout */}
      {isInterior && (
        <>
          {/* Line 2: area scope (full width) */}
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

          {/* Line 3: interior PIC + interior vendor */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="assignee"
              render={({ field }) => {
                const availableUsers =
                  users?.filter(
                    (u) =>
                      u.division?.toLowerCase() ===
                      PROJECT_TYPE_TO_DIVISION[fixedType]
                  ) || []
                if (
                  !isSuperAdmin &&
                  !availableUsers.find((u) => u.id === user?.id) &&
                  user
                ) {
                  availableUsers.push(user)
                }
                return (
                  <FormItem>
                    <FormLabel>Interior PIC</FormLabel>
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
            <FormField
              control={control}
              name="vendor"
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
                        <SelectItem key={v.id} value={v.id}>
                          {v.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </div>

          {/* Line 4: target deadline + contract value */}
          <div className="grid grid-cols-2 gap-4">
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
            {isSuperAdmin && (
              <FormField
                control={control}
                name="contract_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Value (Rp)</FormLabel>
                    <FormControl>
                      <NumberInput
                        value={field.value ?? 0}
                        onChange={field.onChange}
                        step={1000000}
                        min={0}
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </>
      )}

      {/* ARCHITECTURE layout */}
      {isArchitecture && (
        <>
          {/* Line 3: PIC + deadline */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="assignee"
              render={({ field }) => {
                const availableUsers =
                  users?.filter(
                    (u) =>
                      u.division?.toLowerCase() ===
                      PROJECT_TYPE_TO_DIVISION[fixedType]
                  ) || []
                if (
                  !isSuperAdmin &&
                  !availableUsers.find((u) => u.id === user?.id) &&
                  user
                ) {
                  availableUsers.push(user)
                }
                return (
                  <FormItem>
                    <FormLabel>PIC Design / Drafter</FormLabel>
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
          </div>
          {isSuperAdmin && (
            <FormField
              control={control}
              name="contract_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contract Value (Rp)</FormLabel>
                  <FormControl>
                    <NumberInput
                      value={field.value ?? 0}
                      onChange={field.onChange}
                      step={1000000}
                      min={0}
                      placeholder="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </>
      )}

      {/* CIVIL layout */}
      {isCivil && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="vendor"
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
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <div>
            {isSuperAdmin && (
              <FormField
                control={control}
                name="contract_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Value (Rp)</FormLabel>
                    <FormControl>
                      <NumberInput
                        value={field.value ?? 0}
                        onChange={field.onChange}
                        step={1000000}
                        min={0}
                        placeholder="0"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
