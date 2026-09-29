import { useEffect, useRef } from 'react'
import { Pencil, ChevronRight, X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatRupiah } from '@/lib/helpers'
import {
  parseTermType,
  serializeTermType,
  type TermType,
} from '@/lib/invoicing/termCalculation'

interface TermItem {
  name?: string
  percent: string
  amount: number
  termType?: TermType
  status?: string
  paymentDate?: string
  [key: string]: unknown
}

interface PaymentTermsEditorProps {
  items: TermItem[]
  activeTermin: string
  onUpdateItem: (index: number, field: string, value: unknown) => void
  onPercentChange: (index: number, val: string) => void
  onTermTypeChange: (index: number, val: TermType, percentValue: string) => void
  onActiveTerminChange: (val: string) => void
  onAddTerm: () => void
  onRemoveTerm: (index: number) => void
}

export function PaymentTermsEditor({
  items,
  activeTermin,
  onUpdateItem,
  onPercentChange,
  onTermTypeChange,
  onActiveTerminChange,
  onAddTerm,
  onRemoveTerm,
}: PaymentTermsEditorProps) {
  const totalPercentage = items.reduce((sum, item) => {
    const { type, value } = parseTermType(item.percent, item.termType)
    if (type !== 'percentage') return sum
    const n = parseFloat(value)
    return sum + (isNaN(n) ? 0 : n)
  }, 0)
  const isOverAllocated = totalPercentage > 100
  const wasOverAllocated = useRef(false)

  useEffect(() => {
    if (isOverAllocated && !wasOverAllocated.current) {
      toast.warning(
        `Total percentage exceeds 100% (${totalPercentage}%). Check your term allocations.`
      )
    }
    wasOverAllocated.current = isOverAllocated
  }, [isOverAllocated, totalPercentage])

  return (
    <div>
      <h3 className="font-semibold mb-3 text-xs uppercase tracking-wide text-slate-500">
        Payment Terms Details
      </h3>
      <div className="space-y-3">
        {items.map((item, index) => {
          const isActive = activeTermin === String(index + 1)
          const isPastTerm = index + 1 < Number(activeTermin)
          const { type: percentType, value: percentValue } = parseTermType(
            item.percent,
            item.termType
          )

          return (
            <div
              key={index}
              className={`p-3 rounded border text-xs shadow-sm transition-all ${isActive ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-100' : 'bg-white border-slate-200 hover:border-slate-300'}`}
            >
              <div className="flex flex-row items-center justify-between gap-2 mb-2 pb-2 border-b border-dashed border-slate-200">
                <div className="group flex items-center gap-1.5 min-w-0 overflow-hidden">
                  <Input
                    value={item.name}
                    onChange={(e) =>
                      onUpdateItem(index, 'name', e.target.value)
                    }
                    className={`h-6 w-24 shrink-0 px-1 text-xs font-bold border-transparent bg-transparent shadow-none focus-visible:ring-1 focus-visible:ring-slate-400 hover:border-dashed hover:border-slate-300 ${isActive ? 'text-blue-700' : 'text-slate-700'} ${isPastTerm ? 'opacity-70' : ''}`}
                  />
                  <Pencil className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
                  {isActive && (
                    <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider shrink-0">
                      Active
                    </span>
                  )}
                  {isPastTerm && (
                    <span className="text-[9px] text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider shrink-0">
                      Past
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!isActive && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-1.5 text-[10px] text-slate-400 hover:text-blue-600 hover:bg-blue-50 gap-0.5"
                      onClick={() => onActiveTerminChange(String(index + 1))}
                    >
                      Set Active
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  )}
                  <div className="w-24">
                    <Select
                      value={item.status || 'empty'}
                      onValueChange={(val) =>
                        onUpdateItem(
                          index,
                          'status',
                          val === 'empty' ? '' : val
                        )
                      }
                    >
                      <SelectTrigger
                        className={`h-6 text-[10px] w-full ${item.status === 'Success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white'}`}
                      >
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empty">
                          <span className="text-slate-400">Unpaid</span>
                        </SelectItem>
                        <SelectItem value="Success">
                          <span className="font-bold text-green-600">Paid</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50"
                      onClick={() => onRemoveTerm(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Row 1: Term Type + optional % */}
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-0.5">
                  <Label className="text-[9px] text-slate-400 uppercase">
                    Term Type
                  </Label>
                  <Select
                    value={percentType}
                    onValueChange={(val: TermType) => {
                      onTermTypeChange(index, val, percentValue)
                    }}
                  >
                    <SelectTrigger className="h-7 text-xs bg-white w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed_dp">Fixed DP</SelectItem>
                      <SelectItem value="settlement">Settlement</SelectItem>
                      <SelectItem value="custom_amount">
                        Custom Amount
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {percentType === 'percentage' && (
                  <div className="w-16 space-y-0.5">
                    <Label className="text-[9px] text-slate-400 uppercase">
                      %
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={percentValue}
                      onChange={(e) =>
                        onPercentChange(
                          index,
                          serializeTermType('percentage', e.target.value).percent
                        )
                      }
                      placeholder="50"
                      className="h-7 text-xs bg-white text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                )}
              </div>

              {/* Row 2: Amount + Pay Date */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="space-y-0.5">
                  <Label className="text-[9px] text-slate-400 uppercase">
                    Amount {percentType !== 'custom_amount' && '(Auto)'}
                  </Label>
                  <Input
                    type={percentType === 'custom_amount' ? 'number' : 'text'}
                    min={percentType === 'custom_amount' ? 0 : undefined}
                    value={
                      percentType === 'custom_amount'
                        ? Number(item.amount) || 0
                        : formatRupiah(Number(item.amount) || 0)
                    }
                    readOnly={percentType !== 'custom_amount'}
                    disabled={percentType !== 'custom_amount'}
                    onChange={
                      percentType === 'custom_amount'
                        ? (e) =>
                            onUpdateItem(
                              index,
                              'amount',
                              Math.max(0, Number(e.target.value) || 0)
                            )
                        : undefined
                    }
                    className={`h-7 text-xs font-mono w-full ${percentType === 'custom_amount' ? 'bg-white border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'}`}
                  />
                </div>

                <div className="space-y-0.5">
                  <Label className="text-[9px] text-slate-400 uppercase">
                    Pay Date
                  </Label>
                  <Input
                    type="date"
                    value={item.paymentDate || ''}
                    onChange={(e) =>
                      onUpdateItem(index, 'paymentDate', e.target.value)
                    }
                    className="h-7 text-[10px] bg-white w-full flex justify-center [&::-webkit-datetime-edit]:flex-none [&::-webkit-datetime-edit-fields-wrapper]:p-0"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3 w-full h-7 text-xs text-slate-500 border-dashed hover:text-slate-700 gap-1"
        onClick={onAddTerm}
      >
        <Plus className="h-3 w-3" />
        Add Term
      </Button>
    </div>
  )
}
