import type { Control, FieldValues, Path, UseFormSetValue } from 'react-hook-form'
import { useEffect, useState } from 'react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { ChevronDown, Check } from 'lucide-react'
import { countries } from '@/lib/constants/countries'
import { parseStoredPhone } from '@/lib/helpers'
import { cn } from '@/lib/utils'

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

function FlagImage({ countryCode, className }: { countryCode: string; className?: string }) {
  const code = countryCode.toLowerCase()
  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/hatscripts/circle-flags@gh-pages/flags/${code}.svg`}
      alt={countryCode}
      className={cn("h-4.5 w-4.5 shrink-0 rounded-full object-cover border border-slate-100", className)}
      loading="lazy"
    />
  )
}


interface PhoneInputFieldProps<T extends FieldValues> {
  control: Control<T>
  setValue: UseFormSetValue<T>
  name: Path<T>
  label?: string
  placeholder?: string
  optional?: boolean
}

export function PhoneInputField<T extends FieldValues>({
  control,
  setValue,
  name,
  label = 'Phone / WhatsApp',
  placeholder = 'e.g. 812-3456-7890',
  optional = true,
}: PhoneInputFieldProps<T>) {
  const [countryCode, setCountryCode] = useState('+62')
  const [localPhone, setLocalPhone] = useState('')
  const [countryPopoverOpen, setCountryPopoverOpen] = useState(false)

  const indonesia = countries.find((c) => c.code === 'ID')
  const otherCountries = countries.filter((c) => c.code !== 'ID')

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Synchronize local states when field value changes (e.g. initial load or form reset)
        useEffect(() => {
          const { prefix, localNumber } = parseStoredPhone(field.value, countries)
          setCountryCode(prefix)
          setLocalPhone(localNumber)
        }, [field.value])

        const handlePhoneChange = (inputValue: string) => {
          setLocalPhone(inputValue)
          const digits = inputValue.replace(/\D/g, '')
          setValue(
            name,
            (digits ? `${countryCode}${digits}` : '') as any,
            { shouldValidate: true, shouldDirty: true }
          )
        }

        return (
          <FormItem>
            <FormLabel>
              {label}{' '}
              {optional && (
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              )}
            </FormLabel>
            <FormControl>
              <div className="flex gap-2">
                <Popover open={countryPopoverOpen} onOpenChange={setCountryPopoverOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      role="combobox"
                      aria-expanded={countryPopoverOpen}
                      className="w-[95px] shrink-0 bg-white px-2 justify-between"
                    >
                      <span className="truncate text-sm">
                        {(() => {
                          const found = countries.find((c) => c.dial_code === countryCode)
                          if (found) {
                            return (
                              <span className="flex items-center gap-1.5">
                                <FlagImage countryCode={found.code} className="h-4 w-4" />
                                <span>{found.dial_code}</span>
                              </span>
                            )
                          }
                          return countryCode
                        })()}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-0.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0 animate-in fade-in-50" align="start" style={{ pointerEvents: 'auto' }}>
                    <Command className="max-h-[260px] overflow-hidden">
                      <CommandInput placeholder="Search country..." className="h-9" />
                      <CommandList className="max-h-[220px] overflow-y-auto">
                        <CommandEmpty>No country found.</CommandEmpty>
                        {indonesia && (
                          <CommandGroup heading="Suggested">
                            <CommandItem
                              value={`${indonesia.name} ${indonesia.dial_code}`}
                              onSelect={() => {
                                setCountryCode(indonesia.dial_code)
                                setValue(
                                  name,
                                  (localPhone ? `${indonesia.dial_code}${localPhone.replace(/\D/g, '')}` : '') as any,
                                  { shouldValidate: true, shouldDirty: true }
                                )
                                setCountryPopoverOpen(false)
                              }}
                              className="flex items-center justify-between cursor-pointer py-1.5 text-slate-700 hover:text-slate-900"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FlagImage countryCode={indonesia.code} className="h-4.5 w-4.5" />
                                <span className="font-semibold text-slate-900 shrink-0">{indonesia.dial_code}</span>
                                <span className="text-slate-500 text-xs truncate">({indonesia.name})</span>
                              </div>
                              {countryCode === indonesia.dial_code && (
                                <Check className="h-4 w-4 text-primary shrink-0" />
                              )}
                            </CommandItem>
                          </CommandGroup>
                        )}
                        <CommandGroup heading="All Countries">
                          {otherCountries.map((c) => (
                            <CommandItem
                              key={`${c.code}-${c.dial_code}`}
                              value={`${c.name} ${c.dial_code}`}
                              onSelect={() => {
                                setCountryCode(c.dial_code)
                                setValue(
                                  name,
                                  (localPhone ? `${c.dial_code}${localPhone.replace(/\D/g, '')}` : '') as any,
                                  { shouldValidate: true, shouldDirty: true }
                                )
                                setCountryPopoverOpen(false)
                              }}
                              className="flex items-center justify-between cursor-pointer py-1.5 text-slate-700 hover:text-slate-900"
                            >
                              <div className="flex items-center gap-2 truncate">
                                <FlagImage countryCode={c.code} className="h-4.5 w-4.5" />
                                <span className="font-semibold text-slate-900 shrink-0">{c.dial_code}</span>
                                <span className="text-slate-500 text-xs truncate">({c.name})</span>
                              </div>
                              {countryCode === c.dial_code && (
                                <Check className="h-4 w-4 text-primary shrink-0" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Input
                  type="text"
                  placeholder={placeholder}
                  value={localPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="bg-white"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
