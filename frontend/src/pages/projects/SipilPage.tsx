import ProjectPageTemplate from './ProjectPageTemplate'

const columns = [
  { id: 'on_contract', title: 'Dalam Kontrak' },
  { id: 'finish', title: 'Serah Terima' },
]

const statusOptions = [
  { value: 'on_contract', label: 'Sedang Berjalan (Kontrak)' },
  { value: 'finish', label: 'Selesai' },
]

export default function SipilPage() {
  return (
    <ProjectPageTemplate
      pageTitle="Sipil Construction"
      projectType="sipil"
      kanbanColumns={columns}
      statusOptions={statusOptions}
      enableKanban={false} // Default buka tab Table
    />
  )
}
