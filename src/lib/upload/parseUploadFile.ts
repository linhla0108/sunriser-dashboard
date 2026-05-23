import * as XLSX from "xlsx"
import type { Applicant } from "@/lib/types"

export type UploadCellValue = string | number | boolean | Date | null

export interface ParsedUploadRow {
  rowNumber: number
  values: Record<string, UploadCellValue>
}

export interface ParsedUploadDataset {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  sheetNames: string[]
  activeSheetName: string | null
  columns: string[]
  rows: ParsedUploadRow[]
  rowCount: number
  columnCount: number
  addedColumns: string[]
  warnings: string[]
}

export interface UploadAnalysis {
  matchedFields: Partial<Record<keyof Applicant, string>>
  missingFields: Array<{ key: keyof Applicant; label: string }>
  populatedByColumn: Record<string, number>
  sampleValues: Record<string, UploadCellValue[]>
}

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv", ".tsv", ".json"]

const CANDIDATE_FIELDS: Array<{ key: keyof Applicant; label: string; aliases: string[]; required?: boolean }> = [
  { key: "name", label: "Name", aliases: ["name", "full name", "candidate name", "họ và tên", "ho ten", "tên", "ten"], required: true },
  { key: "email", label: "Email", aliases: ["email", "e-mail", "mail"], required: true },
  { key: "phone", label: "Phone", aliases: ["phone", "phone number", "mobile", "sdt", "số điện thoại", "so dien thoai"], required: true },
  { key: "position1", label: "Position 1", aliases: ["position 1", "position", "role", "first position", "nguyện vọng 1", "nguyen vong 1"], required: true },
  { key: "position2", label: "Position 2", aliases: ["position 2", "second position", "nguyện vọng 2", "nguyen vong 2"] },
  { key: "dob", label: "Date of birth", aliases: ["dob", "date of birth", "birth date", "birthday", "ngày sinh", "ngay sinh"] },
  { key: "university", label: "University", aliases: ["university", "school", "college", "trường", "truong"] },
  { key: "yearOfStudy", label: "Year of study", aliases: ["year of study", "student year", "năm học", "nam hoc", "year"] },
  { key: "major", label: "Major", aliases: ["major", "field of study", "ngành", "nganh"] },
  { key: "gpa", label: "GPA", aliases: ["gpa", "grade", "score", "điểm", "diem"] },
  { key: "hasExperience", label: "Has experience", aliases: ["has experience", "experience", "kinh nghiệm", "kinh nghiem"] },
  { key: "experienceDesc", label: "Experience description", aliases: ["experience description", "experience desc", "kinh nghiệm chi tiết", "kinh nghiem chi tiet"] },
  { key: "portfolio", label: "Portfolio", aliases: ["portfolio", "cv", "resume", "github", "behance"] },
  { key: "fullTime", label: "Full-time", aliases: ["full-time", "full time", "availability", "toàn thời gian", "toan thoi gian"] },
  { key: "discoveryChannel", label: "Discovery channel", aliases: ["discovery channel", "source", "channel", "biết qua", "biet qua"] },
  { key: "submittedAt", label: "Submitted at", aliases: ["submitted at", "timestamp", "created at", "submission time", "thời gian", "thoi gian"] },
  { key: "batch", label: "Batch", aliases: ["batch", "wave", "đợt", "dot"] },
  { key: "pic", label: "PIC", aliases: ["pic", "owner", "assignee", "hr"] },
  { key: "round1Result", label: "Round 1 result", aliases: ["round 1 result", "r1 result", "round1", "kết quả vòng 1", "ket qua vong 1"] },
  { key: "round1Notes", label: "Round 1 notes", aliases: ["round 1 notes", "r1 notes", "notes", "ghi chú vòng 1", "ghi chu vong 1"] },
  { key: "round2Result", label: "Round 2 result", aliases: ["round 2 result", "r2 result", "round2", "kết quả vòng 2", "ket qua vong 2"] },
]

function extensionFor(fileName: string) {
  const ext = "." + fileName.split(".").pop()?.toLowerCase()
  return ext === "." ? "" : ext
}

function normalizeHeader(value: unknown, index: number) {
  const label = String(value ?? "").trim()
  return label || `Column ${index + 1}`
}

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function uniqueColumns(headers: unknown[]) {
  const counts = new Map<string, number>()
  return headers.map((header, index) => {
    const base = normalizeHeader(header, index)
    const count = counts.get(base.toLowerCase()) ?? 0
    counts.set(base.toLowerCase(), count + 1)
    return count === 0 ? base : `${base} ${count + 1}`
  })
}

function normalizeCell(value: unknown): UploadCellValue {
  if (value === undefined || value === "") return null
  if (value instanceof Date) return value
  if (typeof value === "number" || typeof value === "boolean") return value
  if (value === null) return null
  const text = String(value).trim()
  if (!text) return null
  if (/^0\d+/.test(text)) return text
  const numeric = Number(text.replace(/,/g, ""))
  if (/^-?\d+(?:\.\d+)?$/.test(text.replace(/,/g, "")) && Number.isFinite(numeric)) return numeric
  return text
}

function rowsFromMatrix(matrix: unknown[][]) {
  const headerRow = matrix[0] ?? []
  const columns = uniqueColumns(headerRow)
  const rows = matrix.slice(1).map((row, rowIndex) => {
    const values = Object.fromEntries(columns.map((column, columnIndex) => [column, normalizeCell(row[columnIndex])]))
    return { rowNumber: rowIndex + 2, values }
  })
  return { columns, rows }
}

function parseDelimited(text: string, delimiter: "," | "\t") {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let inQuotes = false

  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"'
        index++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && char === delimiter) {
      row.push(cell)
      cell = ""
      continue
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ""
      continue
    }

    cell += char
  }

  row.push(cell)
  rows.push(row)
  return rows.filter(cells => cells.some(value => value.trim() !== ""))
}

function makeDataset(input: {
  file: File
  fileType: string
  columns: string[]
  rows: ParsedUploadRow[]
  sheetNames?: string[]
  activeSheetName?: string | null
  addedColumns?: string[]
  warnings?: string[]
}): ParsedUploadDataset {
  return {
    id: `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    fileName: input.file.name,
    fileSize: input.file.size,
    fileType: input.fileType,
    sheetNames: input.sheetNames ?? [],
    activeSheetName: input.activeSheetName ?? null,
    columns: input.columns,
    rows: input.rows,
    rowCount: input.rows.length,
    columnCount: input.columns.length,
    addedColumns: input.addedColumns ?? [],
    warnings: input.warnings ?? [],
  }
}

export async function parseUploadFile(file: File): Promise<ParsedUploadDataset> {
  const fileType = extensionFor(file.name)
  if (!ACCEPTED_EXTENSIONS.includes(fileType)) throw new Error(`Unsupported file type: ${fileType}`)

  const buffer = await file.arrayBuffer()

  if (fileType === ".xlsx" || fileType === ".xls") {
    const workbook = XLSX.read(buffer, { cellDates: true, type: "array" })
    const activeSheetName = workbook.SheetNames[0] ?? null
    if (!activeSheetName) throw new Error("No sheets detected.")
    const sheet = workbook.Sheets[activeSheetName]
    const matrix = XLSX.utils.sheet_to_json(sheet, { blankrows: false, defval: null, header: 1, raw: true }) as unknown[][]
    const { columns, rows } = rowsFromMatrix(matrix)
    return makeDataset({ file, fileType, columns, rows, sheetNames: workbook.SheetNames, activeSheetName })
  }

  const text = new TextDecoder().decode(buffer)
  if (fileType === ".csv" || fileType === ".tsv") {
    const { columns, rows } = rowsFromMatrix(parseDelimited(text, fileType === ".tsv" ? "\t" : ","))
    return makeDataset({ file, fileType, columns, rows })
  }

  const parsed = JSON.parse(text) as unknown
  const records = Array.isArray(parsed) ? parsed : [parsed]
  const objectRecords = records.filter((record): record is Record<string, unknown> => !!record && typeof record === "object" && !Array.isArray(record))
  const columns = Array.from(new Set(objectRecords.flatMap(record => Object.keys(record))))
  const rows = objectRecords.map((record, index) => ({
    rowNumber: index + 1,
    values: Object.fromEntries(columns.map(column => [column, normalizeCell(record[column])])),
  }))
  return makeDataset({ file, fileType, columns, rows })
}

export function addColumnsToParsedDataset(dataset: ParsedUploadDataset, columnNames: string[]) {
  const existing = new Set(dataset.columns.map(column => normalizeKey(column)))
  const additions = columnNames.map(column => column.trim()).filter(Boolean).filter(column => !existing.has(normalizeKey(column)))
  if (additions.length === 0) return dataset

  return {
    ...dataset,
    columns: [...dataset.columns, ...additions],
    rows: dataset.rows.map(row => ({
      ...row,
      values: {
        ...row.values,
        ...Object.fromEntries(additions.map(column => [column, null])),
      },
    })),
    columnCount: dataset.columnCount + additions.length,
    addedColumns: [...dataset.addedColumns, ...additions],
  }
}

export function analyzeUploadDataset(dataset: ParsedUploadDataset): UploadAnalysis {
  const normalizedColumns = new Map(dataset.columns.map(column => [normalizeKey(column), column]))
  const matchedFields = Object.fromEntries(
    CANDIDATE_FIELDS.flatMap(field => {
      const matched = field.aliases.map(normalizeKey).map(alias => normalizedColumns.get(alias)).find(Boolean)
      return matched ? [[field.key, matched]] : []
    })
  ) as Partial<Record<keyof Applicant, string>>
  const missingFields = CANDIDATE_FIELDS.filter(field => field.required && !matchedFields[field.key]).map(({ key, label }) => ({ key, label }))
  const populatedByColumn = Object.fromEntries(
    dataset.columns.map(column => [column, dataset.rows.filter(row => row.values[column] !== null && row.values[column] !== "").length])
  )
  const sampleValues = Object.fromEntries(
    dataset.columns.map(column => [
      column,
      dataset.rows
        .map(row => row.values[column])
        .filter(value => value !== null && value !== "")
        .slice(0, 3),
    ])
  )

  return { matchedFields, missingFields, populatedByColumn, sampleValues }
}

function valueFor(row: ParsedUploadRow, analysis: UploadAnalysis, key: keyof Applicant) {
  const column = analysis.matchedFields[key]
  return column ? row.values[column] : null
}

function stringValue(value: UploadCellValue, fallback = "") {
  if (value instanceof Date) return value.toISOString()
  if (value === null) return fallback
  return String(value)
}

function numberValue(value: UploadCellValue, fallback = 0) {
  if (typeof value === "number") return value
  const parsed = Number(String(value ?? "").replace(/[^\d.-]/g, ""))
  return Number.isFinite(parsed) ? parsed : fallback
}

function booleanValue(value: UploadCellValue, fallback = false) {
  if (typeof value === "boolean") return value
  const text = normalizeKey(String(value ?? ""))
  if (["yes", "true", "co", "available", "full time", "1"].includes(text)) return true
  if (["no", "false", "khong", "unavailable", "0"].includes(text)) return false
  return fallback
}

export function mapUploadDatasetToApplicants(dataset: ParsedUploadDataset): Applicant[] {
  const analysis = analyzeUploadDataset(dataset)
  return dataset.rows.map((row, index) => ({
    id: `upload-${dataset.id}-${index + 1}`,
    name: stringValue(valueFor(row, analysis, "name"), `Row ${row.rowNumber}`),
    dob: stringValue(valueFor(row, analysis, "dob")),
    email: stringValue(valueFor(row, analysis, "email")),
    phone: stringValue(valueFor(row, analysis, "phone")),
    position1: stringValue(valueFor(row, analysis, "position1"), "Unmapped position"),
    position2: stringValue(valueFor(row, analysis, "position2")) || undefined,
    university: stringValue(valueFor(row, analysis, "university"), "Unmapped university"),
    yearOfStudy: stringValue(valueFor(row, analysis, "yearOfStudy"), "Unknown"),
    major: stringValue(valueFor(row, analysis, "major"), "Unknown"),
    gpa: numberValue(valueFor(row, analysis, "gpa")),
    hasExperience: booleanValue(valueFor(row, analysis, "hasExperience")),
    experienceDesc: stringValue(valueFor(row, analysis, "experienceDesc")) || undefined,
    portfolio: stringValue(valueFor(row, analysis, "portfolio")) || undefined,
    fullTime: booleanValue(valueFor(row, analysis, "fullTime")),
    discoveryChannel: stringValue(valueFor(row, analysis, "discoveryChannel"), "Uploaded file"),
    submittedAt: stringValue(valueFor(row, analysis, "submittedAt"), new Date().toISOString()),
    batch: numberValue(valueFor(row, analysis, "batch"), 1),
    pic: stringValue(valueFor(row, analysis, "pic")) || undefined,
    round1Result: stringValue(valueFor(row, analysis, "round1Result")) || undefined,
    round1Notes: stringValue(valueFor(row, analysis, "round1Notes")) || undefined,
    round2Result: stringValue(valueFor(row, analysis, "round2Result")) || undefined,
  }))
}
