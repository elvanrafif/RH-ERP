import { useState } from 'react'
import { StickyNote, ChevronDown, ChevronUp } from 'lucide-react'

interface KanbanNotesSectionProps {
  notes: string
}

export function KanbanNotesSection({ notes }: KanbanNotesSectionProps) {
  const [showNotes, setShowNotes] = useState(false)

  return (
    <div className="rounded border border-yellow-100 overflow-hidden bg-yellow-50/40">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowNotes((v) => !v)
        }}
        className="flex items-center justify-between w-full px-2 py-1.5 text-left cursor-pointer hover:bg-yellow-50 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <StickyNote className="h-3 w-3 text-yellow-500 shrink-0" />
          <span className="text-xs text-yellow-600 font-medium">Notes</span>
        </div>
        {showNotes ? (
          <ChevronUp className="h-3 w-3 text-yellow-500" />
        ) : (
          <ChevronDown className="h-3 w-3 text-yellow-500" />
        )}
      </button>
      {showNotes && (
        <p className="px-2 pb-2 text-xs text-slate-500 italic leading-relaxed">
          {notes}
        </p>
      )}
    </div>
  )
}
