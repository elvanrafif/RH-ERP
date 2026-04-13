import ProjectPageTemplate from './ProjectPageTemplate'

const columns = [
  { id: 'active', title: 'Active' },
  { id: 'finish', title: 'Finished' },
]

const statusOptions = [
  { value: 'active', label: 'Active' },
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
