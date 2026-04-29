import ProjectPageTemplate from './ProjectPageTemplate'

const columns = [
  { id: 'building', title: 'Building' },
  { id: 'finishing', title: 'Finishing' },
  { id: 'finish', title: 'Finished' },
]

const statusOptions = [
  { value: 'building', label: 'Building' },
  { value: 'finishing', label: 'Finishing' },
  { value: 'finish', label: 'Finished' },
]

export default function SipilPage() {
  return (
    <ProjectPageTemplate
      pageTitle="Civil Construction"
      projectType="civil"
      kanbanColumns={columns}
      statusOptions={statusOptions}
      enableKanban={false} // Default buka tab Table
    />
  )
}
