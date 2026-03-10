import type { ReactNode, RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Loader2, Save, Share2 } from 'lucide-react'
import { formatRupiah } from '@/lib/helpers'

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
  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      {/* HEADER BAR */}
      <div className="shrink-0 h-auto min-h-14 py-2 lg:py-0 lg:h-14 border-b bg-white flex flex-col lg:flex-row items-center justify-between px-4 shadow-sm z-20 gap-3 lg:gap-0 print:hidden">
        <div className="flex items-center justify-between w-full lg:w-auto gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className={`shrink-0 ${hasUnsavedChanges ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : ''}`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="hidden lg:block h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm font-mono truncate max-w-[150px] sm:max-w-none">
              {documentNumber}
            </span>
            {hasUnsavedChanges && (
              <span className="text-[10px] sm:text-xs text-red-500 italic bg-red-50 px-2 py-1 rounded">
                (Unsaved)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
          <div className="mr-2 lg:mr-4 text-xs sm:text-sm font-medium text-slate-600 whitespace-nowrap">
            {totalLabel}:{' '}
            <span className="text-blue-600 font-bold">
              {formatRupiah(total)}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className={`whitespace-nowrap ${hasUnsavedChanges ? 'border-blue-500 text-blue-600' : ''}`}
            >
              {isSaving ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isSaving ? 'Saving...' : 'Save'}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={onShareWA}
              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 whitespace-nowrap"
            >
              <Share2 className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Share WA</span>
            </Button>

            <Button
              size="sm"
              onClick={onDownload}
              className="whitespace-nowrap"
            >
              <Download className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-y-auto md:overflow-hidden relative z-0">
        {/* LEFT: EDITOR FORM */}
        <div className="w-full md:w-[380px] lg:w-[450px] bg-white border-b md:border-b-0 md:border-r flex flex-col md:h-full md:overflow-y-auto shadow-[2px_0_8px_-2px_rgba(0,0,0,0.1)] z-10 print:hidden shrink-0">
          {leftPanel}
        </div>

        {/* RIGHT: A4 PREVIEW */}
        <div
          ref={previewContainerRef}
          className="flex-1 bg-slate-200/80 p-4 lg:p-8 flex flex-col items-center md:overflow-y-auto print:p-0 print:bg-white print:overflow-visible"
        >
          <div className="mb-4 text-center md:hidden print:hidden mt-4 shrink-0">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-300/50 px-4 py-1.5 rounded-full inline-block">
              A4 Document Preview
            </h3>
          </div>

          <div
            className="w-full flex justify-center print:h-auto print:block"
            style={{ height: `calc(297mm * ${previewScale})` }}
          >
            <div
              className="origin-top transform-gpu print:scale-100"
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
