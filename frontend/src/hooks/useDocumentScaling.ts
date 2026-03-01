import { useEffect, useRef, useState } from 'react'

const A4_BASE_WIDTH = 800

/**
 * Handles dynamic A4 preview scaling via ResizeObserver.
 * Attach `containerRef` to the preview container div.
 * Use `scale` for the CSS transform and height calculation.
 */
export function useDocumentScaling() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newScale = Math.min(entry.contentRect.width / A4_BASE_WIDTH, 1)
        setScale(newScale)
      }
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return { containerRef, scale }
}
