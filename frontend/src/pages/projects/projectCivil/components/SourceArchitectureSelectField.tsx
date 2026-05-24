import type { Control } from 'react-hook-form'
import type { Project, User } from '@/types'
import { MaskingTextByArchitectureStatus } from '@/lib/masking'
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

interface SourceArchitectureSelectFieldProps {
  control: Control<any>
  architectureProjects: Project[]
  users: User[] | undefined
}

export function SourceArchitectureSelectField({
  control,
  architectureProjects,
  users,
}: SourceArchitectureSelectFieldProps) {
  return (
    <FormField
      control={control}
      name="source_architecture"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Converted from Architecture Project</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={(field.value as string) || ''}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="None (fresh project)" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="__none__">None (fresh project)</SelectItem>
              {architectureProjects.map((ap) => (
                <SelectItem key={ap.id} value={ap.id}>
                  {users?.find((u) => u.id === ap.assignee)?.name ?? '—'} ·{' '}
                  {MaskingTextByArchitectureStatus(ap.status)}
                  {(ap.luas_tanah || ap.luas_bangunan) && (
                    <span className="text-muted-foreground">
                      {' '}
                      · L:{ap.luas_tanah ?? 0}m² | B:{ap.luas_bangunan ?? 0}m²
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  )
}
