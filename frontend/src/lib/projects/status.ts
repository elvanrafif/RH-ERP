export interface CivilStatusConfig {
  label: string
  colorClass: string
}

const CIVIL_RAW_STATUS_CONFIG: Record<string, CivilStatusConfig> = {
  building: {
    label: 'Building',
    colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  finishing: {
    label: 'Finishing',
    colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  finish: {
    label: 'Finished',
    colorClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
}

const CIVIL_RAW_STATUS_FALLBACK: CivilStatusConfig = {
  label: 'Unknown',
  colorClass: 'bg-slate-50 text-slate-500 border-slate-200',
}

export function getCivilRawStatusConfig(status: string): CivilStatusConfig {
  return CIVIL_RAW_STATUS_CONFIG[status] ?? CIVIL_RAW_STATUS_FALLBACK
}
