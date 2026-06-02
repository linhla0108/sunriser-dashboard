"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { UploadSession } from "@/lib/upload/UploadSessionContext"
import {
  addColumnsToParsedDataset,
  analyzeUploadDataset,
  mapUploadDatasetToApplicants,
  parseUploadFile,
  type ParsedUploadDataset,
  type UploadAnalysis,
} from "@/lib/upload/parseUploadFile"
import { GlobalDropZoneOverlay } from "./GlobalDropZoneOverlay"
import { GlobalDropZoneToasts } from "./GlobalDropZoneToasts"
import { ACCEPTED_EXTENSIONS, INITIAL_SHOW, MAX_FILE_SIZE, formatSize, type DropState, type Toast } from "./globalDropZoneUtils"

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
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
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
        addToast("error", "Unsupported file type. Accepted: .csv .tsv .json")
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
        setErrorMsg("Could not read file. Please check it is a valid data file.")
        addToast("error", "Could not read file. Please check it is a valid data file.")
      }
    },
    [addToast, resetPopupState]
  )

  useEffect(() => {
    const handleDragOver = (event: DragEvent) => event.preventDefault()

    const handleDragEnter = (event: DragEvent) => {
      event.preventDefault()
      dragCounterRef.current++
      if (dragCounterRef.current === 1 && dropStateRef.current === "idle") setDropState("dragging")
    }

    const handleDragLeave = (event: DragEvent) => {
      event.preventDefault()
      dragCounterRef.current--
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0
        if (dropStateRef.current === "dragging") setDropState("idle")
      }
    }

    const handleDrop = (event: DragEvent) => {
      event.preventDefault()
      dragCounterRef.current = 0

      if (popupRef.current && event.target instanceof Node && popupRef.current.contains(event.target)) return
      if (!event.dataTransfer?.files.length) {
        setDropState("idle")
        return
      }
      if (event.dataTransfer.files.length > 1) addToast("info", "Only one file can be analyzed at a time.")
      parseFile(event.dataTransfer.files[0])
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
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && (dropState === "popup-open" || dropState === "error")) closePopup()
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [dropState, closePopup])

  const allColumns = dataset?.columns ?? []
  const filteredColumns = filterText ? allColumns.filter(column => column.toLowerCase().includes(filterText.toLowerCase())) : allColumns
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

  return (
    <div className="relative">
      {children}
      <GlobalDropZoneOverlay
        analysis={analysis}
        closePopup={closePopup}
        dataset={dataset}
        dropState={dropState}
        errorMsg={errorMsg}
        filterText={filterText}
        filteredColumns={filteredColumns}
        handleConfirm={handleConfirm}
        handleReanalyze={handleReanalyze}
        hiddenCount={hiddenCount}
        matchedCount={matchedCount}
        pillsExpanded={pillsExpanded}
        popupRef={popupRef}
        previewColumns={previewColumns}
        previewRows={previewRows}
        setFilterText={setFilterText}
        setPillsExpanded={setPillsExpanded}
        visibleColumns={visibleColumns}
      />
      <GlobalDropZoneToasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
