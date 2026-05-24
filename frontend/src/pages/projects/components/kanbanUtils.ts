import type { Project } from '@/types'

export type KanbanColumnDefinition = {
  id: string
  title: string
}

export interface KanbanState {
  tasks: Record<string, Project>
  columns: Record<string, { id: string; title: string; taskIds: string[] }>
  columnOrder: string[]
}

export function buildKanbanState(
  data: Project[],
  columnsConfig: KanbanColumnDefinition[]
): KanbanState {
  const tasks: Record<string, Project> = {}
  const columns: Record<string, { id: string; title: string; taskIds: string[] }> = {}
  const columnOrder = columnsConfig.map((c) => c.id)

  columnsConfig.forEach((col) => {
    columns[col.id] = { id: col.id, title: col.title, taskIds: [] }
  })

  data.forEach((project) => {
    tasks[project.id] = project
    const statusKey =
      project.status && columns[project.status] ? project.status : columnOrder[0]
    if (columns[statusKey]) columns[statusKey].taskIds.push(project.id)
  })

  return { tasks, columns, columnOrder }
}
