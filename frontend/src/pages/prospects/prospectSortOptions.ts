import type { SortOption } from '@/hooks/useSort'
import type { Prospect } from '@/types'

const toTime = (val?: string) =>
  val ? new Date(val).getTime() : Infinity

export const PROSPECT_SORT_OPTIONS: SortOption<Prospect>[] = [
  {
    value: 'meeting_asc',
    label: 'Meeting — Soonest',
    compareFn: (a, b) => toTime(a.meeting_schedule) - toTime(b.meeting_schedule),
  },
  {
    value: 'meeting_desc',
    label: 'Meeting — Latest',
    compareFn: (a, b) => toTime(b.meeting_schedule) - toTime(a.meeting_schedule),
  },
  {
    value: 'survey_asc',
    label: 'Survey — Soonest',
    compareFn: (a, b) => toTime(a.survey_schedule) - toTime(b.survey_schedule),
  },
  {
    value: 'survey_desc',
    label: 'Survey — Latest',
    compareFn: (a, b) => toTime(b.survey_schedule) - toTime(a.survey_schedule),
  },
]
