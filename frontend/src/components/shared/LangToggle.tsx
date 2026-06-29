import { cn } from '@/lib/utils'
import type { Lang } from '@/lib/invoicing/invoiceLabels'

interface LangToggleProps {
  lang: Lang
  onChange: (lang: Lang) => void
  className?: string
}

const LANGS: Lang[] = ['en', 'id']

export function LangToggle({ lang, onChange, className }: LangToggleProps) {
  return (
    <div className={cn('flex items-center bg-white border rounded-md p-0.5 shadow-sm', className)}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={cn(
            'px-3 py-1 text-xs font-bold rounded uppercase tracking-wide transition-colors',
            lang === l ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-700'
          )}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
