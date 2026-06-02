"use client"

import type { Dispatch, RefObject, SetStateAction } from "react"
import { AlertCircle, CheckCircle2, Copy, Plus, RefreshCw, UploadCloud, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import type { ParsedUploadDataset, ParsedUploadRow, UploadAnalysis } from "@/lib/upload/parseUploadFile"
import { ACCEPTED_EXTENSIONS, formatCell, formatSize, getFileIcon, type DropState } from "./globalDropZoneUtils"

interface GlobalDropZoneOverlayProps {
  analysis: UploadAnalysis | null
  closePopup: () => void
  dataset: ParsedUploadDataset | null
  dropState: DropState
  errorMsg: string | null
  filterText: string
  filteredColumns: string[]
  handleConfirm: () => void
  handleReanalyze: () => void
  hiddenCount: number
  matchedCount: number
  pillsExpanded: boolean
  popupRef: RefObject<HTMLDivElement | null>
  previewColumns: string[]
  previewRows: ParsedUploadRow[]
  setFilterText: Dispatch<SetStateAction<string>>
  setPillsExpanded: Dispatch<SetStateAction<boolean>>
  visibleColumns: string[]
}

export function GlobalDropZoneOverlay({
  analysis,
  closePopup,
  dataset,
  dropState,
  errorMsg,
  filterText,
  filteredColumns,
  handleConfirm,
  handleReanalyze,
  hiddenCount,
  matchedCount,
  pillsExpanded,
  popupRef,
  previewColumns,
  previewRows,
  setFilterText,
  setPillsExpanded,
  visibleColumns,
}: GlobalDropZoneOverlayProps) {
  const showBackdrop = dropState === "dragging" || dropState === "processing" || dropState === "popup-open" || dropState === "error"
  if (!showBackdrop) return null

  return (
    <div
      data-cid="drop-zone-backdrop"
      className="fixed inset-0 z-40 flex items-end justify-center sm:items-center"
      style={{
        backgroundColor: dropState === "dragging" ? "rgba(252,252,252,0.82)" : "rgba(0,0,0,0.35)",
        backdropFilter: dropState === "dragging" ? "blur(24px)" : undefined,
      }}
    >
      {dropState === "popup-open" ? (
        <Button
          type="button"
          variant="plain"
          size="plain"
          aria-label="Close upload popup"
          className="absolute inset-0 z-0 h-full w-full"
          onClick={closePopup}
        />
      ) : null}

      {dropState === "dragging" ? <DraggingOverlay /> : null}
      {dropState === "processing" ? <ProcessingOverlay popupRef={popupRef} /> : null}
      {dropState === "error" ? <ErrorOverlay errorMsg={errorMsg} popupRef={popupRef} onClose={closePopup} /> : null}

      {dropState === "popup-open" && dataset && analysis ? (
        <ParsedDatasetPopup
          analysis={analysis}
          closePopup={closePopup}
          dataset={dataset}
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
      ) : null}
    </div>
  )
}

function DraggingOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" style={{ animation: "slideUpFade 200ms ease-out" }}>
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
  )
}

function ProcessingOverlay({ popupRef }: { popupRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={popupRef} data-cid="drop-zone-processing" className="mx-4 flex items-center gap-3 rounded-3xl bg-white px-5 py-4 sm:mx-0">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#FF5533] border-t-transparent" />
      <p className="text-sm font-medium text-[#555555]">Parsing file...</p>
    </div>
  )
}

function ErrorOverlay({ errorMsg, popupRef, onClose }: { errorMsg: string | null; popupRef: RefObject<HTMLDivElement | null>; onClose: () => void }) {
  return (
    <div ref={popupRef} className="mx-4 w-full max-w-[480px] rounded-3xl bg-white p-6 sm:mx-0" data-cid="drop-zone-popup">
      <div className="flex items-start gap-3">
        <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-red-500" />
        <div className="flex-1">
          <p className="mb-1 text-sm font-semibold text-[#1b1b1b]">{errorMsg ?? "Something went wrong."}</p>
          <p className="text-xs text-[#767676]">Please check the file and try again.</p>
        </div>
        <Button variant="plain" size="plain" onClick={onClose} className="text-[#767676] hover:text-[#1b1b1b]">
          <X size={16} />
        </Button>
      </div>
      <Button
        variant="plain"
        size="plain"
        onClick={onClose}
        className="mt-4 h-10 w-full rounded-full border border-[#1b1b1b] text-sm font-semibold text-[#1b1b1b] transition-colors hover:bg-[#f9f9f9]"
      >
        Dismiss
      </Button>
    </div>
  )
}

interface ParsedDatasetPopupProps extends Omit<GlobalDropZoneOverlayProps, "analysis" | "dataset" | "dropState" | "errorMsg"> {
  analysis: UploadAnalysis
  dataset: ParsedUploadDataset
}

function ParsedDatasetPopup({
  analysis,
  closePopup,
  dataset,
  filterText,
  filteredColumns,
  handleConfirm,
  handleReanalyze,
  hiddenCount,
  matchedCount,
  pillsExpanded,
  popupRef,
  previewColumns,
  previewRows,
  setFilterText,
  setPillsExpanded,
  visibleColumns,
}: ParsedDatasetPopupProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="contents">
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
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-[#f9f9f9]">{getFileIcon(dataset.fileType)}</div>
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
            <MetricCard label="Matched fields" value={matchedCount} />
            <MetricCard label="Missing required" value={analysis.missingFields.length} />
            <MetricCard label="Preview rows" value={previewRows.length} />
          </div>

          <ColumnPills
            dataset={dataset}
            filterText={filterText}
            filteredColumns={filteredColumns}
            hiddenCount={hiddenCount}
            pillsExpanded={pillsExpanded}
            setPillsExpanded={setPillsExpanded}
            visibleColumns={visibleColumns}
          />

          <MissingFieldsPanel analysis={analysis} filterText={filterText} handleReanalyze={handleReanalyze} setFilterText={setFilterText} />
          <ValuePreview previewColumns={previewColumns} previewRows={previewRows} />

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
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuGroup>
          <ContextMenuLabel className="truncate">{dataset.fileName}</ContextMenuLabel>
          <ContextMenuItem onClick={() => navigator.clipboard.writeText(dataset.fileName)}>
            <Copy />
            Copy file name
          </ContextMenuItem>
          <ContextMenuItem onClick={handleReanalyze}>
            <RefreshCw />
            Re-analyze columns
          </ContextMenuItem>
          <ContextMenuItem disabled={dataset.rowCount === 0} onClick={handleConfirm}>
            <CheckCircle2 />
            Analyze in table
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem variant="destructive" onClick={closePopup}>
            <X />
            Remove upload
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[#e2e2e2] bg-[#f9f9f9] p-3">
      <p className="text-[10px] font-semibold tracking-widest text-[#767676] uppercase">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[#1b1b1b]">{value}</p>
    </div>
  )
}

function ColumnPills({
  dataset,
  filterText,
  filteredColumns,
  hiddenCount,
  pillsExpanded,
  setPillsExpanded,
  visibleColumns,
}: Pick<
  ParsedDatasetPopupProps,
  "dataset" | "filterText" | "filteredColumns" | "hiddenCount" | "pillsExpanded" | "setPillsExpanded" | "visibleColumns"
>) {
  return (
    <div>
      <p className="mb-2.5 text-[10px] font-semibold tracking-widest text-[#767676] uppercase">Columns Detected</p>
      {filteredColumns.length === 0 && filterText ? (
        <p className="mb-2 text-xs text-[#767676]">No columns match. Re-analyze to add it as a missing column.</p>
      ) : null}
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
        {!pillsExpanded && hiddenCount > 0 ? <ColumnToggle label={`+${hiddenCount} more`} onClick={() => setPillsExpanded(true)} /> : null}
        {pillsExpanded && hiddenCount > 0 ? <ColumnToggle label="Collapse" onClick={() => setPillsExpanded(false)} /> : null}
      </div>
    </div>
  )
}

function ColumnToggle({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      variant="plain"
      size="plain"
      onClick={onClick}
      className="rounded-xl border border-[#e2e2e2] bg-[#f9f9f9] px-2.5 py-1 text-xs text-[#767676] transition-colors hover:border-[#FF5533] hover:text-[#FF5533]"
    >
      {label}
    </Button>
  )
}

function MissingFieldsPanel({
  analysis,
  filterText,
  handleReanalyze,
  setFilterText,
}: Pick<ParsedDatasetPopupProps, "analysis" | "filterText" | "handleReanalyze" | "setFilterText">) {
  return (
    <div className="rounded-2xl border border-[#e2e2e2] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold text-[#1b1b1b]">Missing fields</p>
        <p className="text-xs text-[#767676]">
          {analysis.missingFields.length ? analysis.missingFields.map(field => field.label).join(", ") : "Required candidate fields are covered."}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          data-cid="drop-zone-col-input"
          type="text"
          placeholder="Add missing column names, comma separated"
          value={filterText}
          onChange={event => setFilterText(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter") handleReanalyze()
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
  )
}

function ValuePreview({ previewColumns, previewRows }: Pick<GlobalDropZoneOverlayProps, "previewColumns" | "previewRows">) {
  return (
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
  )
}
