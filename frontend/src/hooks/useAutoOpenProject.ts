import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Project } from '@/types'

/**
 * Reads `?open=<projectId>` from the URL, waits for projects to load,
 * finds the matching project, and auto-opens the details modal.
 * Cleans the URL param after opening so refresh doesn't re-trigger.
 */
export function useAutoOpenProject(projects: Project[], isLoading: boolean) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [projectToView, setProjectToView] = useState<Project | null>(null)

  useEffect(() => {
    const openId = searchParams.get('open')
    if (!openId || isLoading || projects.length === 0) return

    const match = projects.find((p) => p.id === openId)
    if (match) {
      setProjectToView(match)
      setSearchParams((prev) => {
        prev.delete('open')
        return prev
      }, { replace: true })
    }
  }, [searchParams, projects, isLoading])

  return { projectToView, setProjectToView }
}
