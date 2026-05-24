import { useFieldArray, type Control } from 'react-hook-form'
import type { ProjectFormValues } from '@/lib/validations/project'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { Plus, X } from 'lucide-react'

const MAX_LINKS = 5

interface AdditionalLinksFieldProps {
  control: Control<ProjectFormValues>
}

export function AdditionalLinksField({ control }: AdditionalLinksFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'additional_links',
  })

  return (
    <div className="space-y-2 pb-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium leading-none">
          Additional Links
        </label>
        {fields.length < MAX_LINKS && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ label: '', url: '' })}
            className="h-7 text-xs gap-1 shrink-0"
          >
            <Plus className="h-3 w-3" />
            Add Link
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <FormField
              control={control}
              name={`additional_links.${index}.label`}
              render={({ field: inputField }) => (
                <FormItem className="w-[130px] shrink-0">
                  <FormControl>
                    <Input
                      placeholder="Label..."
                      {...inputField}
                      value={inputField.value || ''}
                      className="h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`additional_links.${index}.url`}
              render={({ field: inputField }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="https://..."
                      {...inputField}
                      value={inputField.value || ''}
                      className="h-9"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive mt-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 leading-relaxed pt-0.5">
        Add any links related to this project (drawings, documents, files,
        etc.). Ensure all links are internal and secured under the company.
      </p>
    </div>
  )
}
