"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { X, FileSpreadsheet, FileText, File, AlertCircle, CheckCircle2, Plus } from "lucide-react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"

interface ParsedFile {
  name: string
  size: string
  rows: number
  columns: string[]
  fileType: string
}

interface Toast {
  id: string
  type: "success" | "error" | "warning" | "info"
  message: string
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

type DropState = "idle" | "dragging" | "processing" | "popup-open" | "error"

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv", ".tsv", ".json"]

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
  onAnalyze: () => void
}

export default function GlobalDropZone({ children, onAnalyze }: GlobalDropZoneProps) {
  const [dropState, setDropState] = useState<DropState>("idle")
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [filterText, setFilterText] = useState("")
  const [customColumns, setCustomColumns] = useState<string[]>([])
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

  const closePopup = useCallback(() => {
    setDropState("idle")
    setParsedFile(null)
    setErrorMsg(null)
    setFilterText("")
    setCustomColumns([])
    setPillsExpanded(false)
  }, [])

  // Keep dropStateRef in sync so drag event handlers don't need dropState in their closure
  useEffect(() => {
    dropStateRef.current = dropState
  }, [dropState])

  const parseFile = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        addToast("error", `File too large (${formatSize(file.size)}). Maximum size is 50 MB.`)
        return
      }

      setDropState("processing")
      setErrorMsg(null)
      setParsedFile(null)

      const ext = "." + file.name.split(".").pop()!.toLowerCase()

      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        setDropState("idle")
        addToast("error", `Unsupported file type. Accepted: .xlsx .xls .csv .tsv .json`)
        return
      }

      try {
        const buffer = await file.arrayBuffer()
        let columns: string[] = []
        let rows = 0

        if (ext === ".xlsx" || ext === ".xls") {
          const workbook = XLSX.read(buffer, { type: "array" })
          const sheet = workbook.Sheets[workbook.SheetNames[0]]
          const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][]
          if (json.length > 0) {
            columns = (json[0] ?? []).map(c => String(c ?? "")).filter(Boolean)
            rows = json.length - 1
          }
        } else if (ext === ".csv" || ext === ".tsv") {
          const text = new TextDecoder().decode(buffer)
          const delimiter = ext === ".tsv" ? "\t" : ","
          const lines = text.trim().split("\n")
          if (lines.length > 0) {
            columns = lines[0].split(delimiter).map(c => c.trim().replace(/"/g, ""))
            rows = lines.length - 1
          }
        } else if (ext === ".json") {
          const text = new TextDecoder().decode(buffer)
          const data = JSON.parse(text)
          const arr = Array.isArray(data) ? data : [data]
          if (arr.length > 0) {
            columns = Object.keys(arr[0])
            rows = arr.length
          }
        }

        if (columns.length === 0) {
          setDropState("error")
          setErrorMsg("No columns detected.")
          return
        }

        if (rows === 0) {
          addToast("warning", "File has no data rows. Columns detected but nothing to analyze.")
        } else {
          addToast("success", `File parsed: ${file.name}. ${rows.toLocaleString()} rows, ${columns.length} columns.`)
        }

        setParsedFile({
          name: file.name,
          size: formatSize(file.size),
          rows,
          columns,
          fileType: ext,
        })
        setDropState("popup-open")
        setFilterText("")
        setCustomColumns([])
        setPillsExpanded(false)
      } catch {
        setDropState("error")
        setErrorMsg("Could not read file. Please check it is a valid spreadsheet or data file.")
        addToast("error", "Could not read file. Please check it is a valid spreadsheet or data file.")
      }
    },
    [addToast]
  )

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      dragCounterRef.current++
      if (dragCounterRef.current === 1 && dropStateRef.current === "idle") {
        setDropState("dragging")
      }
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

      // Ignore drops from inside popup
      if (popupRef.current && e.target instanceof Node && popupRef.current.contains(e.target)) {
        return
      }

      // Ignore non-file drags
      if (!e.dataTransfer?.files.length) {
        setDropState("idle")
        return
      }

      if (e.dataTransfer.files.length > 1) {
        addToast("info", "Only one file can be analyzed at a time.")
        parseFile(e.dataTransfer.files[0])
        return
      }

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
      if (e.key === "Escape" && (dropState === "popup-open" || dropState === "error")) {
        closePopup()
      }
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [dropState, closePopup])

  const allColumns = parsedFile ? [...parsedFile.columns, ...customColumns] : []
  const INITIAL_SHOW = 10

  const filteredColumns = filterText ? allColumns.filter(c => c.toLowerCase().includes(filterText.toLowerCase())) : allColumns

  const visibleColumns = pillsExpanded ? filteredColumns : filteredColumns.slice(0, INITIAL_SHOW)
  const hiddenCount = filteredColumns.length - INITIAL_SHOW

  function handleAddColumn() {
    const trimmed = filterText.trim()
    if (!trimmed) return
    const exists = allColumns.some(c => c.toLowerCase() === trimmed.toLowerCase())
    if (exists) return
    setCustomColumns(prev => [...prev, trimmed])
    setFilterText("")
  }

  function handleRemoveCustom(col: string) {
    setCustomColumns(prev => prev.filter(c => c !== col))
  }

  function handleAnalyze() {
    closePopup()
    onAnalyze()
    addToast("success", "Switched to Table view.")
  }

  const showBackdrop = dropState === "dragging" || dropState === "processing" || dropState === "popup-open" || dropState === "error"

  return (
    <div className="relative">
      {children}

      {/* Drag-over backdrop */}
      {showBackdrop && (
        <div
          data-cid="drop-zone-backdrop"
          className="fixed inset-0 z-40 flex items-end justify-center sm:items-center"
          style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
        >
          {dropState === "popup-open" && (
            <Button
              type="button"
              variant="plain"
              size="plain"
              aria-label="Close upload popup"
              className="absolute inset-0 h-full w-full"
              onClick={closePopup}
            />
          )}

          {/* Drag hint */}
          {dropState === "dragging" && (
            <p className="pointer-events-none mb-40 text-xl font-semibold tracking-tight text-white">Drop your file to analyze</p>
          )}

          {/* Processing spinner */}
          {dropState === "processing" && (
            <div ref={popupRef} className="mx-4 flex items-center gap-3 rounded-3xl bg-white px-5 py-4 sm:mx-0">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FF5533] border-t-transparent" />
              <p className="text-sm font-medium text-[#555555]">Parsing file…</p>
            </div>
          )}

          {/* Error state */}
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

          {/* Popup card — mobile: bottom sheet, desktop: centered modal */}
          {dropState === "popup-open" && parsedFile && (
            <div
              ref={popupRef}
              data-cid="drop-zone-popup"
              className="mx-0 max-h-[80vh] w-full space-y-4 overflow-y-auto rounded-t-3xl bg-white p-4 sm:mx-4 sm:w-full sm:max-w-[480px] sm:rounded-3xl"
              style={{
                animation: "slideUpFade 200ms ease-out",
                boxShadow: "rgba(4, 23, 43, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 24px 48px -12px",
              }}
            >
              {/* File info row */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#f9f9f9]">
                  {getFileIcon(parsedFile.fileType)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#1b1b1b]" title={parsedFile.name}>
                    {parsedFile.name}
                  </p>
                  <p className="mt-0.5 text-xs text-[#767676]">
                    {parsedFile.size} · {parsedFile.rows.toLocaleString()} rows · {parsedFile.columns.length} columns detected
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

              <div className="h-px bg-[#f9f9f9]" />

              {/* Columns section */}
              <div>
                <p className="mb-2.5 text-[10px] font-semibold tracking-widest text-[#767676] uppercase">Columns Detected</p>

                {filteredColumns.length === 0 && filterText && (
                  <p className="mb-2 text-xs text-[#767676]">
                    No columns match. Press <span className="font-semibold">[+]</span> to add as custom.
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {visibleColumns.map(col => {
                    const isCustom = customColumns.includes(col)
                    return (
                      <span
                        key={col}
                        className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-medium ${
                          isCustom
                            ? "border-2 border-dashed border-[#FF5533] bg-[#fff5f3] text-[#FF5533]"
                            : "border border-[#e2e2e2] bg-[#f9f9f9] text-[#555555]"
                        }`}
                      >
                        {col}
                        {isCustom && (
                          <Button variant="plain" size="plain" onClick={() => handleRemoveCustom(col)} className="ml-0.5 hover:opacity-60">
                            <X size={10} />
                          </Button>
                        )}
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
                      +{hiddenCount} more ▸
                    </Button>
                  )}
                  {pillsExpanded && hiddenCount > 0 && (
                    <Button
                      variant="plain"
                      size="plain"
                      onClick={() => setPillsExpanded(false)}
                      className="rounded-xl border border-[#e2e2e2] bg-[#f9f9f9] px-2.5 py-1 text-xs text-[#767676] transition-colors hover:border-[#FF5533] hover:text-[#FF5533]"
                    >
                      ▴ collapse
                    </Button>
                  )}
                </div>
              </div>

              {/* Filter / add input */}
              <div>
                <p className="mb-2 text-xs text-[#6B5549]">Don&apos;t see your column?</p>
                <div className="flex items-center gap-2">
                  <input
                    data-cid="drop-zone-col-input"
                    type="text"
                    placeholder="Filter or add column name..."
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") handleAddColumn()
                    }}
                    className="h-9 flex-1 rounded-2xl border border-[#e2e2e2] bg-white px-3 text-sm text-[#1b1b1b] transition-colors placeholder:text-[#767676] focus:border-[#FF5533] focus:outline-none"
                  />
                  <Button
                    variant="plain"
                    size="plain"
                    onClick={handleAddColumn}
                    disabled={!filterText.trim()}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e2e2e2] bg-[#f9f9f9] text-[#555555] transition-colors hover:border-[#FF5533] hover:text-[#FF5533] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Add column"
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>

              <div className="h-px bg-[#f9f9f9]" />

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  variant="plain"
                  size="plain"
                  onClick={handleAnalyze}
                  disabled={parsedFile.rows === 0}
                  className="h-10 flex-1 rounded-full bg-[#FF5533] text-sm font-semibold text-white transition-colors hover:bg-[#E63D1F] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Analyze in Table
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

      {/* Toast stack — bottom-right, above mobile nav */}
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
