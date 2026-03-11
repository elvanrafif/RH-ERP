import ProjectPageTemplate from './ProjectPageTemplate'

const columns = [
  { id: 'draft_skematik', title: 'Schematic Draft' },
  { id: 'detail_drawing', title: 'Detail Drawing' },
  { id: 'finish', title: 'Finish' },
]

const statusOptions = [
  { value: 'draft_skematik', label: 'Schematic Draft' },
  { value: 'detail_drawing', label: 'Detail Drawing' },
  { value: 'finish', label: 'Finish' },
]

export default function InteriorPage() {
  return (
    <ProjectPageTemplate
      pageTitle="Interior Project"
      projectType="interior"
      kanbanColumns={columns}
      statusOptions={statusOptions}
    />
  )
}
