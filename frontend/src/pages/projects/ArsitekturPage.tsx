import ProjectPageTemplate from './ProjectPageTemplate'

const columns = [
  { id: 'denah', title: 'Floor Plan' },
  { id: 'fasad', title: 'Facade' },
  { id: 'detail_drawing', title: 'Detail Drawing' },
  { id: 'finish', title: 'Finish' },
]

const statusOptions = [
  { value: 'denah', label: 'Floor Plan Stage' },
  { value: 'fasad', label: 'Facade Stage' },
  { value: 'detail_drawing', label: 'Detail Drawing' },
  { value: 'finish', label: 'Finish' },
]

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
