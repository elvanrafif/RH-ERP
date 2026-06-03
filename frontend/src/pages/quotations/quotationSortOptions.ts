export const QUOTATION_SORT_OPTIONS = [
  { value: 'created_desc', label: 'Newest First', sortParam: '-created' },
  { value: 'created_asc', label: 'Oldest First', sortParam: 'created' },
  { value: 'area_desc', label: 'Largest Area', sortParam: '-project_area' },
  { value: 'area_asc', label: 'Smallest Area', sortParam: 'project_area' },
] as const
