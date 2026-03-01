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

interface TermItem {
  name?: string
  percent: string
  amount: number
  status?: string
  paymentDate?: string
  [key: string]: unknown
}

interface PaymentTermsEditorProps {
  items: TermItem[]
  activeTermin: string
  grandTotal: number
  onUpdateItem: (index: number, field: string, value: unknown) => void
  onPercentChange: (index: number, val: string) => void
}

export function PaymentTermsEditor({
  items,
  activeTermin,
  onUpdateItem,
  onPercentChange,
}: PaymentTermsEditorProps) {
  return (
    <div>
      <h3 className="font-semibold mb-3 text-xs uppercase tracking-wide text-slate-500">
        Payment Terms Details
      </h3>
      <div className="space-y-3">
        {items.map((item, index) => {
          const isActive = activeTermin === String(index + 1)
          const isPastTerm = index + 1 < Number(activeTermin)

          return (
            <div
              key={index}
              className={`p-3 rounded border text-xs shadow-sm transition-all ${isActive ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-100' : 'bg-white border-slate-200 hover:border-slate-300'}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-dashed border-slate-200">
                <div className="flex items-center gap-2">
                  <Input
                    value={item.name}
                    onChange={(e) => onUpdateItem(index, 'name', e.target.value)}
                    className={`h-6 w-32 px-1 text-xs font-bold border-none bg-transparent shadow-none focus-visible:ring-0 ${isActive ? 'text-blue-700' : 'text-slate-700'} ${isPastTerm ? 'opacity-70' : ''}`}
                  />
                  {isActive && (
                    <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                      Active
                    </span>
                  )}
                  {isPastTerm && (
                    <span className="text-[9px] text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                      Past
                    </span>
                  )}
                </div>

                <div className="w-full sm:w-28">
                  <Select
                    value={item.status || 'empty'}
                    onValueChange={(val) =>
                      onUpdateItem(index, 'status', val === 'empty' ? '' : val)
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 items-center">
                <div className="sm:col-span-2 space-y-0.5 flex justify-between sm:block">
                  <Label className="text-[9px] text-slate-400 uppercase sm:mb-1">Desc / %</Label>
                  <Input
                    value={item.percent}
                    onChange={(e) => onPercentChange(index, e.target.value)}
                    placeholder="DP / 50%"
                    className="h-7 text-xs bg-white w-24 sm:w-full"
                  />
                </div>

                <div className="sm:col-span-3 space-y-0.5 flex justify-between sm:block">
                  <Label className="text-[9px] text-slate-400 uppercase sm:mb-1">
                    Amount (Auto)
                  </Label>
                  <Input
                    value={formatRupiah(Number(item.amount) || 0)}
                    readOnly
                    disabled
                    className="h-7 text-xs font-mono bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed w-32 sm:w-full"
                  />
                </div>

                <div className="sm:col-span-2 space-y-0.5 flex justify-between sm:block">
                  <Label className="text-[9px] text-slate-400 uppercase sm:mb-1">Pay Date</Label>
                  <Input
                    type="date"
                    value={item.paymentDate || ''}
                    onChange={(e) => onUpdateItem(index, 'paymentDate', e.target.value)}
                    className="h-7 text-[10px] px-1 bg-white w-28 sm:w-full"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
