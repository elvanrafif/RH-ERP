import { useEffect, useRef, useState } from 'react'
import { A4_BASE_WIDTH } from '@/lib/constant'

/**
 * Handles dynamic A4 preview scaling via ResizeObserver.
 * Scales the document to ALWAYS fit within the available container area.
 */
export function useDocumentScaling() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5) // Start with small scale to avoid initial overflow

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const A4_BASE_HEIGHT = (297 / 210) * A4_BASE_WIDTH

    const observer = new ResizeObserver((entries) => {
      // Use requestAnimationFrame to ensure we read dimensions after browser layout
      window.requestAnimationFrame(() => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect
          
          if (width === 0 || height === 0) return

          // Padding safe area (adjust as needed)
          const padding = 32
          const targetW = width - padding
          const targetH = height - padding

          const scaleW = targetW / A4_BASE_WIDTH
          const scaleH = targetH / A4_BASE_HEIGHT
          
          // Use the smaller scale to ensure it fits both dimensions
          const newScale = Math.min(scaleW, scaleH)
          
          // Only update if change is significant to avoid infinite loops or jitter
          if (Math.abs(newScale - scale) > 0.001) {
            setScale(newScale)
          }
        }
      })
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [scale])

  return { containerRef, scale }
}
