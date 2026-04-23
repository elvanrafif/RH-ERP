// frontend/src/components/dashboard/tabs/ClientTrackingTab.tsx
import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useClientTracking } from '@/hooks/useClientTracking'
import { SemesterCard } from './SemesterCard'

export function ClientTrackingTab() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const { s1, s2, availableYears, isLoading } = useClientTracking(year)

  const yearOptions = availableYears.length > 0 ? availableYears : [currentYear]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Client Tracking</h3>
          <p className="text-xs text-slate-500 mt-1">
            Daftar project per client, dikelompokkan per semester.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={String(year)}
            onValueChange={(val) => setYear(Number(val))}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Two-column semester cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SemesterCard
          title="Semester 1"
          dateRange={`Jan – Jun ${year}`}
          projects={s1}
          isLoading={isLoading}
        />
        <SemesterCard
          title="Semester 2"
          dateRange={`Jul – Des ${year}`}
          projects={s2}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
