import type { Control } from 'react-hook-form'
import type { User } from '@/types'
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

interface ProjectPicSelectFieldProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>
  users: User[]
  label: string
  disabled?: boolean
  showUnassigned?: boolean
}

export function ProjectPicSelectField({
  control,
  users,
  label,
  disabled,
  showUnassigned,
}: ProjectPicSelectFieldProps) {
  const { isSuperAdmin } = useRole()

  const isDisabled = disabled !== undefined ? disabled : !isSuperAdmin
  const canUnassign = showUnassigned !== undefined ? showUnassigned : isSuperAdmin

  return (
    <FormField
      control={control}
      name="assignee"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value as string}
            disabled={isDisabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select PIC" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {canUnassign && (
                <SelectItem value="unassigned">-- Unassigned --</SelectItem>
              )}
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name || u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  )
}
