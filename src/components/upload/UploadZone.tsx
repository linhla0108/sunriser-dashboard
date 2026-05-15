'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileSpreadsheet, FileText, File, CheckCircle2, AlertCircle } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ParsedFile {
  name: string
  size: string
  rows: number
  columns: string[]
  fileType: string
}

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv', '.json', '.tsv']

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(type: string) {
  if (type.includes('sheet') || type === '.xlsx' || type === '.xls') {
    return <FileSpreadsheet size={32} className="text-[#17191c]" />
  }
  if (type === '.csv' || type === '.tsv') {
    return <FileText size={32} className="text-[#4c4c4c]" />
  }
  return <File size={32} className="text-[#777b86]" />
}

interface UploadZoneProps {
  onAnalyze?: () => void
}

export default function UploadZone({ onAnalyze }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const parseFile = useCallback(async (file: File) => {
    setError(null)
    setIsProcessing(true)
    setParsedFile(null)

    const ext = '.' + file.name.split('.').pop()!.toLowerCase()

    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setError(`Unsupported file type. Please upload: ${ACCEPTED_EXTENSIONS.join(', ')}`)
      setIsProcessing(false)
      return
    }

    try {
      const buffer = await file.arrayBuffer()
      let columns: string[] = []
      let rows = 0

      if (ext === '.xlsx' || ext === '.xls') {
        const workbook = XLSX.read(buffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][]
        if (json.length > 0) {
          columns = (json[0] ?? []).map((c) => String(c ?? '')).filter(Boolean)
          rows = json.length - 1
        }
      } else if (ext === '.csv' || ext === '.tsv') {
        const text = new TextDecoder().decode(buffer)
        const delimiter = ext === '.tsv' ? '\t' : ','
        const lines = text.trim().split('\n')
        if (lines.length > 0) {
          columns = lines[0].split(delimiter).map((c) => c.trim().replace(/"/g, ''))
          rows = lines.length - 1
        }
      } else if (ext === '.json') {
        const text = new TextDecoder().decode(buffer)
        const data = JSON.parse(text)
        const arr = Array.isArray(data) ? data : [data]
        if (arr.length > 0) {
          columns = Object.keys(arr[0])
          rows = arr.length
        }
      }

      setParsedFile({
        name: file.name,
        size: formatSize(file.size),
        rows,
        columns: columns.slice(0, 20),
        fileType: ext,
      })
    } catch {
      setError('Failed to parse file. Please check it is valid and try again.')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) parseFile(file)
    },
    [parseFile]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  const handleAnalyze = () => {
    onAnalyze?.()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-3xl cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-2 border-[#17191c] bg-[#f7f7f8]'
            : 'border-2 border-dashed border-[#e5e7eb] bg-white hover:border-[#17191c] hover:bg-[#f7f7f8]/50'
        }`}
        style={{
          boxShadow: isDragging
            ? 'rgba(4, 23, 43, 0.08) 0px 0px 0px 1px'
            : undefined,
        }}
      >
        <div className="py-16 px-8 flex flex-col items-center gap-4 text-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${
              isDragging ? 'bg-[#17191c]' : 'bg-[#f7f7f8]'
            }`}
          >
            <Upload
              size={24}
              className={isDragging ? 'text-white' : 'text-[#4c4c4c]'}
            />
          </div>

          <div>
            <p className="text-[#17191c] font-semibold text-base mb-1">
              {isDragging ? 'Drop your file here' : 'Drag & drop your file'}
            </p>
            <p className="text-sm text-[#a3a6af]">
              or click to browse from your computer
            </p>
          </div>

          {/* File type pills */}
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {ACCEPTED_EXTENSIONS.map((ext) => (
              <span
                key={ext}
                className="px-3 py-1 rounded-full bg-[#f7f7f8] text-xs font-mono text-[#777b86] border border-[#e5e7eb]"
              >
                {ext}
              </span>
            ))}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Processing state */}
      {isProcessing && (
        <div className="bg-white rounded-3xl p-6 flex items-center gap-4"
          style={{ boxShadow: 'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.06) 0px 4px 12px' }}
        >
          <div className="w-5 h-5 border-2 border-[#17191c] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#4c4c4c]">Parsing file...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 rounded-3xl p-5 flex items-start gap-3 border border-red-100">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Success: file preview */}
      {parsedFile && (
        <div
          className="bg-white rounded-3xl p-6 space-y-5"
          style={{
            boxShadow:
              'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px',
          }}
        >
          {/* File info row */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#f7f7f8] flex items-center justify-center flex-shrink-0">
              {getFileIcon(parsedFile.fileType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#17191c] truncate">{parsedFile.name}</p>
              <p className="text-sm text-[#777b86] mt-0.5">
                {parsedFile.size} · {parsedFile.rows.toLocaleString()} rows ·{' '}
                {parsedFile.columns.length} columns
              </p>
            </div>
            <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
          </div>

          {/* Column preview */}
          <div>
            <p className="text-xs font-semibold text-[#a3a6af] uppercase tracking-wider mb-3">
              Columns detected
            </p>
            <div className="flex flex-wrap gap-2">
              {parsedFile.columns.map((col) => (
                <span
                  key={col}
                  className="px-2.5 py-1 rounded-xl bg-[#f7f7f8] text-xs text-[#4c4c4c] border border-[#e5e7eb]"
                >
                  {col}
                </span>
              ))}
              {parsedFile.columns.length === 20 && (
                <span className="px-2.5 py-1 rounded-xl bg-[#f7f7f8] text-xs text-[#a3a6af]">
                  + more...
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleAnalyze}
              className="flex-1 h-11 rounded-full bg-[#17191c] text-white text-sm font-semibold hover:bg-[#2d3035] transition-colors"
            >
              Analyze in Table
            </button>
            <button
              onClick={() => {
                setParsedFile(null)
                setError(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
              className="h-11 px-6 rounded-full border border-[#17191c] text-[#17191c] text-sm font-semibold hover:bg-[#f7f7f8] transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
