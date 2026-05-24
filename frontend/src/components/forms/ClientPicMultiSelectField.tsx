import type { Control } from 'react-hook-form'
import type { ClientFormValues } from '@/lib/validations/client'
import type { User } from '@/types'
import { useState } from 'react'
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronDown, Users } from 'lucide-react'
import { getInitials } from '@/lib/helpers'

interface ClientPicMultiSelectFieldProps {
  control: Control<ClientFormValues>
  users: User[]
}

export function ClientPicMultiSelectField({ control, users }: ClientPicMultiSelectFieldProps) {
  const [open, setOpen] = useState(false)

  return (
    <FormField
      control={control}
      name="pic_users"
      render={({ field }) => {
        const selected: string[] = field.value ?? []
        const selectedUsers = users.filter((u) => selected.includes(u.id))

        const toggle = (userId: string) => {
          const next = selected.includes(userId)
            ? selected.filter((id) => id !== userId)
            : [...selected, userId]
          field.onChange(next)
        }

        return (
          <FormItem>
            <FormLabel className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Managed By{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </FormLabel>
            <FormControl>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full justify-between h-9 font-normal"
                  >
                    {selectedUsers.length === 0 ? (
                      <span className="text-muted-foreground">Select managers...</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1.5">
                          {selectedUsers.slice(0, 3).map((u) => (
                            <div
                              key={u.id}
                              className="h-5 w-5 rounded-full bg-primary/10 border border-white flex items-center justify-center text-primary font-bold text-[9px]"
                            >
                              {getInitials(u.name || u.email)}
                            </div>
                          ))}
                        </div>
                        <span className="text-sm text-slate-700">
                          {selectedUsers.length === 1
                            ? selectedUsers[0].name || selectedUsers[0].email
                            : `${selectedUsers.length} managers selected`}
                        </span>
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] p-2" align="start">
                  {users.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-2 py-1.5">No users found.</p>
                  ) : (
                    <div className="space-y-0.5">
                      {users.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer"
                          onClick={() => toggle(u.id)}
                        >
                          <Checkbox
                            checked={selected.includes(u.id)}
                            onCheckedChange={() => toggle(u.id)}
                          />
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                            {getInitials(u.name || u.email)}
                          </div>
                          <span className="text-sm text-slate-700 truncate">
                            {u.name || u.email}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </FormControl>
          </FormItem>
        )
      }}
    />
  )
}
