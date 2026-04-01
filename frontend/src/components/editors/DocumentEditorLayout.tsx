import { type ReactNode, type RefObject, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Download,
  Eye,
  FileEdit,
  Loader2,
  Save,
  Share2,
} from 'lucide-react'
import { formatRupiah } from '@/lib/helpers'
import { A4_BASE_WIDTH } from '@/lib/constant'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface DocumentEditorLayoutProps {
  documentNumber: string
  hasUnsavedChanges: boolean
  onBack: () => void
  totalLabel?: string
  total: number
  isSaving: boolean
  onSave: () => void
  onShareWA: () => void
  onDownload: () => void
  previewContainerRef: RefObject<HTMLDivElement | null>
  previewScale: number
  leftPanel: ReactNode
  preview: ReactNode
}

export function DocumentEditorLayout({
  documentNumber,
  hasUnsavedChanges,
  onBack,
  totalLabel = 'Total',
  total,
  isSaving,
  onSave,
  onShareWA,
  onDownload,
  previewContainerRef,
  previewScale,
  leftPanel,
  preview,
}: DocumentEditorLayoutProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  const actionButtons = () => (
    <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide justify-center lg:justify-start">
      <Button
        variant="outline"
        size="sm"
        onClick={onSave}
        disabled={isSaving}
        className={cn(
          'whitespace-nowrap h-8 text-[11px] px-3 flex-1 lg:flex-none max-w-[120px] lg:max-w-none',
          hasUnsavedChanges ? 'border-blue-500 text-blue-600' : ''
        )}
      >
        {isSaving ? (
          <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" />
        ) : (
          <Save className="mr-1.5 h-3.5 w-3.5" />
        )}
        <span>{isSaving ? 'Saving...' : 'Save'}</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onShareWA}
        className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 whitespace-nowrap h-8 text-[11px] px-3"
      >
        <Share2 className="mr-1.5 h-3.5 w-3.5" />
        <span>Share WA</span>
      </Button>

      <Button
        size="sm"
        onClick={onDownload}
        className="whitespace-nowrap h-8 text-[11px] px-3"
      >
        <Download className="mr-1.5 h-3.5 w-3.5" />
        <span>Download</span>
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden relative">
      {/* HEADER BAR */}
      <div className="shrink-0 h-auto py-2 border-b bg-white flex flex-col lg:flex-row lg:items-center lg:h-14 justify-between px-4 shadow-sm z-20 gap-3 print:hidden transition-all duration-300">
        {/* TOP ROW: BACK + DOC NUMBER */}
        <div className="flex items-center justify-between w-full lg:w-auto gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className={cn(
                'h-8 px-2',
                hasUnsavedChanges
                  ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                  : ''
              )}
            >
              <ArrowLeft className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="h-6 w-px bg-slate-200 hidden md:block" />
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-xs sm:text-sm font-mono truncate max-w-[120px] sm:max-w-none">
                {documentNumber}
              </span>
              {hasUnsavedChanges && (
                <span className="text-[10px] text-red-500 italic bg-red-50 px-1.5 py-0.5 rounded">
                  (Unsaved)
                </span>
              )}
            </div>
          </div>

          {/* TOTAL INFO (MOBILE TOP RIGHT) */}
          <div className="lg:hidden text-right">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter leading-none mb-0.5">
              {totalLabel}
            </div>
            <div className="text-blue-600 font-black text-sm leading-none">
              {formatRupiah(total)}
            </div>
          </div>
        </div>

        {/* MOBILE TABS SWITCHER */}
        <div className="flex lg:hidden w-full">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger
                value="edit"
                className="text-[10px] uppercase font-bold tracking-wider"
              >
                <FileEdit className="mr-1.5 h-3 w-3" />
                Editor
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="text-[10px] uppercase font-bold tracking-wider"
              >
                <Eye className="mr-1.5 h-3 w-3" />
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* RIGHT ACTION AREA */}
        <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-4 w-full lg:w-auto">
          {/* TOTAL INFO (DESKTOP) */}
          <div className="hidden lg:block text-right">
            <span className="text-xs text-slate-500 font-medium mr-1">
              {totalLabel}:
            </span>
            <span className="text-blue-600 font-bold text-sm">
              {formatRupiah(total)}
            </span>
          </div>

          {/* ACTION BUTTONS */}
          <div className="w-full lg:w-auto flex justify-center">
            {actionButtons()}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden relative z-0">
        {/* LEFT: EDITOR FORM */}
        <div
          className={cn(
            'w-full lg:w-[420px] xl:w-[450px] bg-white border-b lg:border-b-0 lg:border-r flex flex-col h-full overflow-y-auto shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)] z-10 print:hidden shrink-0 transition-all duration-300',
            activeTab === 'preview' ? 'hidden lg:flex' : 'flex'
          )}
        >
          {leftPanel}
        </div>

        {/* RIGHT: A4 PREVIEW */}
        <div
          ref={previewContainerRef}
          className={cn(
            'flex-1 min-w-0 bg-slate-200/80 flex flex-col items-center justify-center overflow-hidden print:p-0 print:bg-white print:overflow-visible transition-all duration-300 relative',
            activeTab === 'edit'
              ? 'hidden lg:flex'
              : 'flex h-[calc(100vh-180px)] lg:h-full',
            'p-4 lg:p-6'
          )}
        >
          <div className="absolute top-4 left-0 w-full text-center lg:hidden print:hidden z-10">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-300/50 px-3 py-1 rounded-full inline-block">
              A4 Document Preview
            </h3>
          </div>

          <div
            className="shrink-0 shadow-2xl bg-white origin-center transform-gpu transition-all duration-500"
            style={{
              width: A4_BASE_WIDTH * previewScale,
              height: (297 / 210) * A4_BASE_WIDTH * previewScale,
              transform: `scale(1)`,
            }}
          >
            <div
              className="origin-top-left transform-gpu print:scale-100 print:transform-none"
              style={{ transform: `scale(${previewScale})` }}
            >
              {preview}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
