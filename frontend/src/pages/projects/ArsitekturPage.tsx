import ProjectPageTemplate from './ProjectPageTemplate'
import { MaskingTextByArchitectureStatus } from '@/lib/masking'

const ARCH_STATUS_VALUES = ['denah', 'fasad', 'detail_drawing', 'finish']

const columns = [
  { id: 'denah', title: 'Floor Plan' },
  { id: 'fasad', title: 'Facade' },
  { id: 'detail_drawing', title: 'Detail Drawing' },
  { id: 'finish', title: 'Finish' },
]

const statusOptions = ARCH_STATUS_VALUES.map((value) => ({
  value,
  label: MaskingTextByArchitectureStatus(value),
}))

export default function ArsitekturPage() {
  return (
    <ProjectPageTemplate
      pageTitle="Architecture & Design"
      projectType="architecture"
      kanbanColumns={columns}
      statusOptions={statusOptions}
    />
  )
}
