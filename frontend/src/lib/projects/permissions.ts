import { TypeProjectsBoolean } from '@/lib/booleans'
import type { Project, User } from '@/types'

export function canEditProject(
  project: Project,
  user: User | null,
  isSuperAdmin: boolean
): boolean {
  if (isSuperAdmin) return true
  if (!user) return false
  const { isCivil } = TypeProjectsBoolean(project.type)
  if (isCivil) return project.meta_data?.pic_lapangan === user.name
  return project.assignee === user.id
}
