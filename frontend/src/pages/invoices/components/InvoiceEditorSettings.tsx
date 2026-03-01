import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TermItem {
  percent: string
  amount: number
  [key: string]: unknown
}

interface Client {
  id: string
  company_name: string
  [key: string]: unknown
}

interface InvoiceEditorSettingsProps {
  type: string
  activeTermin: string
  items: TermItem[]
  selectedClientId: string
  date: string
  projectArea: number
  pricePerMeter: number
  manualTotal: number
  clientsList: Client[] | undefined
  onActiveTerminChange: (val: string) => void
  onClientChange: (val: string) => void
  onDateChange: (val: string) => void
  onProjectAreaChange: (val: number) => void
  onPricePerMeterChange: (val: number) => void
  onManualTotalChange: (val: number) => void
}

export function InvoiceEditorSettings({
  type,
  activeTermin,
  items,
  selectedClientId,
  date,
  projectArea,
  pricePerMeter,
  manualTotal,
  clientsList,
  onActiveTerminChange,
  onClientChange,
  onDateChange,
  onProjectAreaChange,
  onPricePerMeterChange,
  onManualTotalChange,
}: InvoiceEditorSettingsProps) {
  return (
    <div className="space-y-4 border-b pb-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-xs uppercase tracking-wide text-slate-500">
          Settings ({type.toUpperCase()})
        </h3>
        <div className="flex items-center gap-2">
          <Label className="text-[10px] sm:text-xs uppercase font-bold text-yellow-700 whitespace-nowrap">
            Active Term:
          </Label>
          <Select value={activeTermin} onValueChange={onActiveTerminChange}>
            <SelectTrigger className="h-7 w-24 text-xs bg-yellow-50 border-yellow-200 text-yellow-800">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {items.map((_, i) => (
                <SelectItem key={i} value={String(i + 1)}>
                  Term {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] text-slate-500">Client</Label>
          <Select value={selectedClientId} onValueChange={onClientChange}>
            <SelectTrigger className="h-8 text-xs bg-white">
              <SelectValue placeholder="Select Client" />
            </SelectTrigger>
            <SelectContent>
              {clientsList?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.company_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-slate-500">Invoice Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded border">
        {type === 'design' ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-slate-500">Area (m²)</Label>
              <Input
                type="number"
                value={projectArea}
                onChange={(e) => onProjectAreaChange(Number(e.target.value))}
                className="h-7 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-slate-500">Price / m²</Label>
              <Input
                type="number"
                value={pricePerMeter}
                onChange={(e) => onPricePerMeterChange(Number(e.target.value))}
                className="h-7 text-xs"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <Label className="text-[10px] text-slate-500 font-bold uppercase text-blue-600">
              Total Contract Value (IDR)
            </Label>
            <Input
              type="number"
              value={manualTotal}
              onChange={(e) => onManualTotalChange(Number(e.target.value))}
              className="h-8 text-sm font-mono border-blue-200 focus-visible:ring-blue-500"
              placeholder="Enter total value..."
            />
          </div>
        )}
      </div>
    </div>
  )
}
