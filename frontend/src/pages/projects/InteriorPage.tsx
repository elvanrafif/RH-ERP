import ProjectPageTemplate from './ProjectPageTemplate'

const columns = [
  { id: 'draft_skematik', title: 'Draft Skematik' },
  { id: 'detail_drawing', title: 'Detail Drawing' },
  { id: 'finish', title: 'Finish' },
]

const statusOptions = [
  { value: 'draft_skematik', label: 'Draft Skematik' },
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
