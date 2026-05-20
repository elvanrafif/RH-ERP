import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NumberInput } from '@/components/shared/NumberInput'
import { ClientCombobox } from '@/components/forms/ClientCombobox'
import type { Client } from '@/types'

interface InvoiceEditorSettingsProps {
  type: string
  selectedClientId: string
  date: string
  projectArea: number
  pricePerMeter: number
  manualTotal: number
  discountPercent: number
  onClientChange: (val: string) => void
  onClientSelect?: (client: Client) => void
  onDateChange: (val: string) => void
  onProjectAreaChange: (val: number) => void
  onPricePerMeterChange: (val: number) => void
  onManualTotalChange: (val: number) => void
  onDiscountPercentChange: (val: number) => void
}

export function InvoiceEditorSettings({
  type,
  selectedClientId,
  date,
  projectArea,
  pricePerMeter,
  manualTotal,
  discountPercent,
  onClientChange,
  onClientSelect,
  onDateChange,
  onProjectAreaChange,
  onPricePerMeterChange,
  onManualTotalChange,
  onDiscountPercentChange,
}: InvoiceEditorSettingsProps) {
  return (
    <div className="space-y-4 border-b pb-6">
      <h3 className="font-semibold text-xs uppercase tracking-wide text-slate-500">
        Invoice Details
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] text-slate-500">Client</Label>
          <ClientCombobox
            value={selectedClientId}
            onChange={onClientChange}
            onClientSelect={onClientSelect}
            className="h-8 text-xs bg-white"
            clearable={false}
          />
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

      {type === 'design' ? (
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] text-slate-500">Area (m²)</Label>
            <NumberInput
              value={projectArea}
              onChange={onProjectAreaChange}
              step={1}
              min={0}
              placeholder="0"
              decimal
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-slate-500">Price / m²</Label>
            <NumberInput
              value={pricePerMeter}
              onChange={onPricePerMeterChange}
              step={10000}
              min={0}
              placeholder="0"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-slate-500">Discount (%)</Label>
            <NumberInput
              value={discountPercent}
              onChange={onDiscountPercentChange}
              step={0.5}
              min={0}
              max={100}
              placeholder="0"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] text-slate-500 font-bold uppercase text-blue-600">
              Total Contract Value (IDR)
            </Label>
            <NumberInput
              value={manualTotal}
              onChange={onManualTotalChange}
              step={1000000}
              min={0}
              placeholder="Enter total value..."
              inputClassName="font-mono border-blue-200"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-slate-500">Discount (%)</Label>
            <NumberInput
              value={discountPercent}
              onChange={onDiscountPercentChange}
              step={0.5}
              min={0}
              max={100}
              placeholder="0"
            />
          </div>
        </div>
      )}
    </div>
  )
}
