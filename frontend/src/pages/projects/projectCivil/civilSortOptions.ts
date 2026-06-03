import type { SortOption } from '@/hooks/useSort'
import type { Project } from '@/types'

export const CIVIL_SORT_OPTIONS: SortOption<Project>[] = [
  {
    value: 'deadline_asc',
    label: 'Soonest Deadline',
    compareFn: (a, b) => {
      const aTime = a.end_date ? new Date(a.end_date).getTime() : Infinity
      const bTime = b.end_date ? new Date(b.end_date).getTime() : Infinity
      return aTime - bTime
    },
  },
  {
    value: 'deadline_desc',
    label: 'Latest Deadline',
    compareFn: (a, b) => {
      const aTime = a.end_date ? new Date(a.end_date).getTime() : Infinity
      const bTime = b.end_date ? new Date(b.end_date).getTime() : Infinity
      return bTime - aTime
    },
  },
  {
    value: 'land_desc',
    label: 'Largest Land Area',
    compareFn: (a, b) => (b.luas_tanah ?? 0) - (a.luas_tanah ?? 0),
  },
  {
    value: 'land_asc',
    label: 'Smallest Land Area',
    compareFn: (a, b) => (a.luas_tanah ?? 0) - (b.luas_tanah ?? 0),
  },
  {
    value: 'building_desc',
    label: 'Largest Building Area',
    compareFn: (a, b) => (b.luas_bangunan ?? 0) - (a.luas_bangunan ?? 0),
  },
  {
    value: 'building_asc',
    label: 'Smallest Building Area',
    compareFn: (a, b) => (a.luas_bangunan ?? 0) - (b.luas_bangunan ?? 0),
  },
]
