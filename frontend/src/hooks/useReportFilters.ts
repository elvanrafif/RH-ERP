// src/hooks/useReportFilters.ts
import { useSearchParams } from 'react-router-dom'
import type { Granularity, ProjectTypeFilter } from '@/lib/invoicing/reportCalculations'

const now = new Date()
const DEFAULT_YEAR = now.getFullYear()
const DEFAULT_MONTH = now.getMonth() + 1
const DEFAULT_QUARTER = Math.ceil(DEFAULT_MONTH / 3)

export function useReportFilters() {
  const [params, setParams] = useSearchParams()

  const granularity = (params.get('g') as Granularity) || 'monthly'
  const year = parseInt(params.get('y') ?? '') || DEFAULT_YEAR
  const month = parseInt(params.get('m') ?? '') || DEFAULT_MONTH
  const quarter = parseInt(params.get('q') ?? '') || DEFAULT_QUARTER
  const projectType = (params.get('t') as ProjectTypeFilter) || 'all'

  function setGranularity(g: Granularity) {
    setParams(p => { const n = new URLSearchParams(p); n.set('g', g); return n })
  }
  function setYear(y: number) {
    setParams(p => { const n = new URLSearchParams(p); n.set('y', String(y)); return n })
  }
  function setMonth(m: number) {
    setParams(p => { const n = new URLSearchParams(p); n.set('m', String(m)); return n })
  }
  function setQuarter(q: number) {
    setParams(p => { const n = new URLSearchParams(p); n.set('q', String(q)); return n })
  }
  function setProjectType(t: ProjectTypeFilter) {
    setParams(p => { const n = new URLSearchParams(p); n.set('t', t); return n })
  }

  return { granularity, year, month, quarter, projectType, setGranularity, setYear, setMonth, setQuarter, setProjectType }
}
