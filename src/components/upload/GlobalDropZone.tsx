"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AlertCircle, CheckCircle2, File, FileSpreadsheet, FileText, Plus, RefreshCw, UploadCloud, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UploadSession } from "@/lib/upload/UploadSessionContext"
import {
  addColumnsToParsedDataset,
  analyzeUploadDataset,
  mapUploadDatasetToApplicants,
  parseUploadFile,
  type ParsedUploadDataset,
  type UploadAnalysis,
  type UploadCellValue,
} from "@/lib/upload/parseUploadFile"

interface Toast {
  id: string
  type: "success" | "error" | "warning" | "info"
  message: string
}

const MAX_FILE_SIZE = 50 * 1024 * 1024
const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv", ".tsv", ".json"]
const INITIAL_SHOW = 10

type DropState = "idle" | "dragging" | "processing" | "popup-open" | "error"

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatCell(value: UploadCellValue) {
  if (value instanceof Date) return value.toLocaleDateString()
  if (value === null) return "empty"
  return String(value)
}

function getFileIcon(ext: string) {
  if (ext === ".xlsx" || ext === ".xls") return <FileSpreadsheet size={32} className="text-[#FF5533]" />
  if (ext === ".csv" || ext === ".tsv") return <FileText size={32} className="text-[#555555]" />
  return <File size={32} className="text-[#6B5549]" />
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const bgMap = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  }
  const iconMap = {
    success: <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-green-600" />,
    error: <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-red-600" />,
    warning: <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-amber-600" />,
    info: <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-blue-600" />,
  }

  return (
    <div
      className={`flex max-w-[360px] items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm shadow-lg ${bgMap[toast.type]}`}
      style={{ animation: "slideInRight 200ms ease-out" }}
      role="alert"
      aria-live="polite"
    >
      {iconMap[toast.type]}
      <span className="flex-1 text-[13px] leading-relaxed">{toast.message}</span>
      <Button variant="plain" size="plain" onClick={() => onDismiss(toast.id)} className="mt-0.5 opacity-60 transition-opacity hover:opacity-100">
        <X size={13} />
      </Button>
    </div>
  )
}

interface GlobalDropZoneProps {
  children: React.ReactNode
  onAnalyze: (session: UploadSession) => void
}

export default function GlobalDropZone({ children, onAnalyze }: GlobalDropZoneProps) {
  const [dropState, setDropState] = useState<DropState>("idle")
  const [dataset, setDataset] = useState<ParsedUploadDataset | null>(null)
  const [analysis, setAnalysis] = useState<UploadAnalysis | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [filterText, setFilterText] = useState("")
  const [pillsExpanded, setPillsExpanded] = useState(false)
  const dragCounterRef = useRef(0)
  const popupRef = useRef<HTMLDivElement>(null)
  const dropStateRef = useRef<DropState>("idle")

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = String(Date.now())
    setToasts(prev => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const resetPopupState = useCallback(() => {
    setDataset(null)
    setAnalysis(null)
    setErrorMsg(null)
    setFilterText("")
    setPillsExpanded(false)
  }, [])

  const closePopup = useCallback(() => {
    setDropState("idle")
    resetPopupState()
  }, [resetPopupState])

  useEffect(() => {
    dropStateRef.current = dropState
  }, [dropState])

  const parseFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        addToast("error", `File too large (${formatSize(file.size)}). Maximum size is 50 MB.`)
        return
      }

      const ext = "." + file.name.split(".").pop()?.toLowerCase()
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setDropState("idle")
        addToast("error", "Unsupported file type. Accepted: .xlsx .xls .csv .tsv .json")
        return
      }

      setDropState("processing")
      resetPopupState()

      try {
        const parsed = await parseUploadFile(file)
        if (parsed.columns.length === 0) {
          setDropState("error")
          setErrorMsg("No columns detected.")
          return
        }

        setDataset(parsed)
        setAnalysis(analyzeUploadDataset(parsed))
        setDropState("popup-open")

        if (parsed.rowCount === 0) {
          addToast("warning", "File has columns but no data rows.")
        } else {
          addToast("success", `File parsed: ${file.name}. ${parsed.rowCount.toLocaleString()} rows, ${parsed.columnCount} columns.`)
        }
      } catch {
        setDropState("error")
        setErrorMsg("Could not read file. Please check it is a valid spreadsheet or data file.")
        addToast("error", "Could not read file. Please check it is a valid spreadsheet or data file.")
      }
    },
    [addToast, resetPopupState]
  )

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => e.preventDefault()

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      dragCounterRef.current++
      if (dragCounterRef.current === 1 && dropStateRef.current === "idle") setDropState("dragging")
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      dragCounterRef.current--
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0
        if (dropStateRef.current === "dragging") setDropState("idle")
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      dragCounterRef.current = 0

      if (popupRef.current && e.target instanceof Node && popupRef.current.contains(e.target)) return
      if (!e.dataTransfer?.files.length) {
        setDropState("idle")
        return
      }
      if (e.dataTransfer.files.length > 1) addToast("info", "Only one file can be analyzed at a time.")
      parseFile(e.dataTransfer.files[0])
    }

    document.addEventListener("dragover", handleDragOver)
    document.addEventListener("dragenter", handleDragEnter)
    document.addEventListener("dragleave", handleDragLeave)
    document.addEventListener("drop", handleDrop)

    return () => {
      document.removeEventListener("dragover", handleDragOver)
      document.removeEventListener("dragenter", handleDragEnter)
      document.removeEventListener("dragleave", handleDragLeave)
      document.removeEventListener("drop", handleDrop)
    }
  }, [parseFile, addToast])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (dropState === "popup-open" || dropState === "error")) closePopup()
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [dropState, closePopup])

  const allColumns = dataset?.columns ?? []
  const filteredColumns = filterText ? allColumns.filter(c => c.toLowerCase().includes(filterText.toLowerCase())) : allColumns
  const visibleColumns = pillsExpanded ? filteredColumns : filteredColumns.slice(0, INITIAL_SHOW)
  const hiddenCount = Math.max(filteredColumns.length - INITIAL_SHOW, 0)
  const previewColumns = allColumns.slice(0, 4)
  const previewRows = dataset?.rows.slice(0, 3) ?? []
  const matchedCount = analysis ? Object.keys(analysis.matchedFields).length : 0

  function handleReanalyze() {
    if (!dataset) return
    const additions = filterText
      .split(",")
      .map(value => value.trim())
      .filter(Boolean)
    const nextDataset = additions.length > 0 ? addColumnsToParsedDataset(dataset, additions) : dataset
    setDataset(nextDataset)
    setAnalysis(analyzeUploadDataset(nextDataset))
    setFilterText("")
    setPillsExpanded(true)
    if (additions.length > 0) addToast("success", `Re-analyzed with ${additions.length} added column${additions.length > 1 ? "s" : ""}.`)
  }

  function handleConfirm() {
    if (!dataset) return
    const finalAnalysis = analyzeUploadDataset(dataset)
    const session: UploadSession = {
      id: dataset.id,
      confirmedAt: new Date().toISOString(),
      dataset,
      analysis: finalAnalysis,
      applicants: mapUploadDatasetToApplicants(dataset),
    }
    closePopup()
    onAnalyze(session)
    addToast("success", "Upload confirmed. Opening Candidates.")
  }

  const showBackdrop = dropState === "dragging" || dropState === "processing" || dropState === "popup-open" || dropState === "error"

  return (
    <div className="relative">
      {children}

      {showBackdrop && (
        <div
          data-cid="drop-zone-backdrop"
          className="fixed inset-0 z-40 flex items-end justify-center sm:items-center"
          style={{
            backgroundColor: dropState === "dragging" ? "rgba(252,252,252,0.82)" : "rgba(0,0,0,0.35)",
            backdropFilter: dropState === "dragging" ? "blur(24px)" : undefined,
          }}
        >
          {dropState === "popup-open" && (
            <Button
              type="button"
              variant="plain"
              size="plain"
              aria-label="Close upload popup"
              className="absolute inset-0 z-0 h-full w-full"
              onClick={closePopup}
            />
          )}

          {dropState === "dragging" && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              style={{ animation: "slideUpFade 200ms ease-out" }}
            >
              <div className="absolute inset-5 rounded-3xl border-2 border-dashed border-[#FF5533]/60" />
              <div className="relative flex flex-col items-center gap-5 px-8 text-center">
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-full"
                  style={{
                    animation: "dropzoneFloat 2.6s ease-in-out infinite",
                    background: "radial-gradient(circle, rgba(255,85,51,0.22) 0%, rgba(255,85,51,0.06) 70%)",
                    boxShadow: "0 0 0 1px rgba(255,85,51,0.25), 0 0 48px rgba(255,85,51,0.18)",
                  }}
                >
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-full"
                    style={{ background: "rgba(255,218,211,0.15)", animation: "dropzoneRing 2.2s ease-out infinite" }}
                  >
                    <UploadCloud size={34} strokeWidth={1.6} className="text-[#FF5533]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-bold tracking-tight text-[#1b1b1b]">Drop your file here</p>
                  <p className="text-sm font-medium text-[#6B5549]">Release to parse and prepare for analysis</p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {ACCEPTED_EXTENSIONS.map(ext => (
                    <span
                      key={ext}
                      className="rounded-full border border-[#e2e2e2] px-3 py-1 text-xs font-medium text-[#555555]"
                      style={{ background: "rgba(249,249,249,0.9)" }}
                    >
                      {ext}
                    </span>
                  ))}
                  <span
                    className="rounded-full border border-[#FF5533]/40 px-3 py-1 text-xs font-semibold text-[#FF5533]"
                    style={{ background: "rgba(255,85,51,0.08)" }}
                  >
                    Max 50 MB
                  </span>
                </div>
              </div>
            </div>
          )}

          {dropState === "processing" && (
            <div ref={popupRef} data-cid="drop-zone-processing" className="mx-4 flex items-center gap-3 rounded-3xl bg-white px-5 py-4 sm:mx-0">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FF5533] border-t-transparent" />
              <p className="text-sm font-medium text-[#555555]">Parsing file...</p>
            </div>
          )}

          {dropState === "error" && (
            <div ref={popupRef} className="mx-4 w-full max-w-[480px] rounded-3xl bg-white p-6 sm:mx-0" data-cid="drop-zone-popup">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-red-500" />
                <div className="flex-1">
                  <p className="mb-1 text-sm font-semibold text-[#1b1b1b]">{errorMsg ?? "Something went wrong."}</p>
                  <p className="text-xs text-[#767676]">Please check the file and try again.</p>
                </div>
                <Button variant="plain" size="plain" onClick={closePopup} className="text-[#767676] hover:text-[#1b1b1b]">
                  <X size={16} />
                </Button>
              </div>
              <Button
                variant="plain"
                size="plain"
                onClick={closePopup}
                className="mt-4 h-10 w-full rounded-full border border-[#1b1b1b] text-sm font-semibold text-[#1b1b1b] transition-colors hover:bg-[#f9f9f9]"
              >
                Dismiss
              </Button>
            </div>
          )}

          {dropState === "popup-open" && dataset && analysis && (
            <div
              ref={popupRef}
              data-cid="drop-zone-popup"
              className="relative z-10 mx-0 max-h-[86vh] w-full space-y-4 overflow-y-auto rounded-t-3xl bg-white p-4 sm:mx-4 sm:w-full sm:max-w-[680px] sm:rounded-3xl"
              style={{
                animation: "slideUpFade 200ms ease-out",
                boxShadow: "rgba(4, 23, 43, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 24px 48px -12px",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#f9f9f9]">
                  {getFileIcon(dataset.fileType)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#1b1b1b]" title={dataset.fileName}>
                    {dataset.fileName}
                  </p>
                  <p className="mt-0.5 text-xs text-[#767676]">
                    {formatSize(dataset.fileSize)} · {dataset.rowCount.toLocaleString()} rows · {dataset.columnCount} columns detected
                    {dataset.activeSheetName ? ` · ${dataset.activeSheetName}` : ""}
                  </p>
                </div>
                <Button
                  variant="plain"
                  size="plain"
                  onClick={closePopup}
                  className="flex-shrink-0 text-[#767676] transition-colors hover:text-[#1b1b1b]"
                  aria-label="Close"
                >
                  <X size={16} />
                </Button>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#e2e2e2] bg-[#f9f9f9] p-3">
                  <p className="text-[10px] font-semibold tracking-widest text-[#767676] uppercase">Matched fields</p>
                  <p className="mt-1 text-lg font-semibold text-[#1b1b1b]">{matchedCount}</p>
                </div>
                <div className="rounded-2xl border border-[#e2e2e2] bg-[#f9f9f9] p-3">
                  <p className="text-[10px] font-semibold tracking-widest text-[#767676] uppercase">Missing required</p>
                  <p className="mt-1 text-lg font-semibold text-[#1b1b1b]">{analysis.missingFields.length}</p>
                </div>
                <div className="rounded-2xl border border-[#e2e2e2] bg-[#f9f9f9] p-3">
                  <p className="text-[10px] font-semibold tracking-widest text-[#767676] uppercase">Preview rows</p>
                  <p className="mt-1 text-lg font-semibold text-[#1b1b1b]">{previewRows.length}</p>
                </div>
              </div>

              <div>
                <p className="mb-2.5 text-[10px] font-semibold tracking-widest text-[#767676] uppercase">Columns Detected</p>
                {filteredColumns.length === 0 && filterText && (
                  <p className="mb-2 text-xs text-[#767676]">No columns match. Re-analyze to add it as a missing column.</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {visibleColumns.map(col => {
                    const isAdded = dataset.addedColumns.includes(col)
                    return (
                      <span
                        key={col}
                        className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium ${
                          isAdded
                            ? "border-2 border-dashed border-[#FF5533] bg-[#fff5f3] text-[#FF5533]"
                            : "border border-[#e2e2e2] bg-[#f9f9f9] text-[#555555]"
                        }`}
                      >
                        {col}
                      </span>
                    )
                  })}
                  {!pillsExpanded && hiddenCount > 0 && (
                    <Button
                      variant="plain"
                      size="plain"
                      onClick={() => setPillsExpanded(true)}
                      className="rounded-xl border border-[#e2e2e2] bg-[#f9f9f9] px-2.5 py-1 text-xs text-[#767676] transition-colors hover:border-[#FF5533] hover:text-[#FF5533]"
                    >
                      +{hiddenCount} more
                    </Button>
                  )}
                  {pillsExpanded && hiddenCount > 0 && (
                    <Button
                      variant="plain"
                      size="plain"
                      onClick={() => setPillsExpanded(false)}
                      className="rounded-xl border border-[#e2e2e2] bg-[#f9f9f9] px-2.5 py-1 text-xs text-[#767676] transition-colors hover:border-[#FF5533] hover:text-[#FF5533]"
                    >
                      Collapse
                    </Button>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-[#e2e2e2] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[#1b1b1b]">Missing fields</p>
                  <p className="text-xs text-[#767676]">
                    {analysis.missingFields.length
                      ? analysis.missingFields.map(field => field.label).join(", ")
                      : "Required candidate fields are covered."}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    data-cid="drop-zone-col-input"
                    type="text"
                    placeholder="Add missing column names, comma separated"
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleReanalyze()
                    }}
                    className="h-9 flex-1 rounded-2xl border border-[#e2e2e2] bg-white px-3 text-sm text-[#1b1b1b] transition-colors placeholder:text-[#767676] focus:border-[#FF5533] focus:outline-none"
                  />
                  <Button
                    variant="plain"
                    size="plain"
                    onClick={handleReanalyze}
                    className="flex h-9 items-center gap-2 rounded-full border border-[#e2e2e2] bg-[#f9f9f9] px-3 text-sm font-semibold text-[#555555] transition-colors hover:border-[#FF5533] hover:text-[#FF5533]"
                  >
                    {filterText.trim() ? <Plus size={14} /> : <RefreshCw size={14} />}
                    Re-analyze
                  </Button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold tracking-widest text-[#767676] uppercase">Value preview</p>
                <div className="overflow-hidden rounded-2xl border border-[#e2e2e2]">
                  <div className="grid bg-[#f9f9f9]" style={{ gridTemplateColumns: `repeat(${Math.max(previewColumns.length, 1)}, minmax(0, 1fr))` }}>
                    {previewColumns.map(column => (
                      <div
                        key={column}
                        className="truncate border-r border-[#e2e2e2] px-3 py-2 text-xs font-semibold text-[#555555] last:border-r-0"
                        title={column}
                      >
                        {column}
                      </div>
                    ))}
                  </div>
                  {previewRows.map(row => (
                    <div
                      key={row.rowNumber}
                      className="grid border-t border-[#e2e2e2]"
                      style={{ gridTemplateColumns: `repeat(${Math.max(previewColumns.length, 1)}, minmax(0, 1fr))` }}
                    >
                      {previewColumns.map(column => (
                        <div
                          key={column}
                          className="truncate border-r border-[#e2e2e2] px-3 py-2 text-xs text-[#1b1b1b] last:border-r-0"
                          title={formatCell(row.values[column])}
                        >
                          {formatCell(row.values[column])}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="plain"
                  size="plain"
                  onClick={handleConfirm}
                  disabled={dataset.rowCount === 0}
                  className="h-10 flex-1 rounded-full bg-[#FF5533] text-sm font-semibold text-white transition-colors hover:bg-[#E63D1F] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Confirm upload
                </Button>
                <Button
                  variant="plain"
                  size="plain"
                  onClick={closePopup}
                  className="h-10 rounded-full border border-[#1b1b1b] px-5 text-sm font-semibold text-[#1b1b1b] transition-colors hover:bg-[#f9f9f9]"
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="pointer-events-none fixed right-4 bottom-20 z-50 flex flex-col items-end gap-2 sm:right-6 sm:bottom-6">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </div>
  )
}
