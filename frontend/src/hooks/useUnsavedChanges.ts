import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Tracks unsaved form changes and guards navigation away from the page.
 * Shows a browser confirm dialog if there are unsaved changes before going back.
 */
export function useUnsavedChanges(redirectPath: string) {
  const navigate = useNavigate()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const markAsDirty = () => setHasUnsavedChanges(true)
  const markAsClean = () => setHasUnsavedChanges(false)

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      )
      if (!confirmed) return
    }
    navigate(redirectPath)
  }

  return { hasUnsavedChanges, markAsDirty, markAsClean, handleBack }
}
