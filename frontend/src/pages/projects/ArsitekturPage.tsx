import ProjectPageTemplate from './ProjectPageTemplate'

const columns = [
  { id: 'denah', title: 'Denah' },
  { id: 'fasad', title: 'Fasad' },
  { id: 'detail_drawing', title: 'Detail Drawing' },
  { id: 'finish', title: 'Finish / Selesai' },
]

const statusOptions = [
  { value: 'denah', label: 'Tahap Denah' },
  { value: 'fasad', label: 'Tahap Fasad' },
  { value: 'detail_drawing', label: 'Detail Drawing' },
  { value: 'finish', label: 'Selesai' },
]

export default function ArsitekturPage() {
  return (
    <ProjectPageTemplate
      pageTitle="Arsitektur & Design"
      projectType="architecture"
      kanbanColumns={columns}
      statusOptions={statusOptions}
    />
  )
}
