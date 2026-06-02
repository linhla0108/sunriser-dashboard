import type { Applicant } from "@/lib/types"
import { REQUIRED_SHEET_HEADERS } from "./types"

export interface RowToApplicantError {
  error: string
  column?: string
}

// ─── Date normalisation ───────────────────────────────────────────────────────

// Accepts yyyy-mm-dd or dd/mm/yyyy; returns ISO yyyy-mm-dd or '' on failure.
function normDate(raw: string): string {
  if (!raw) return ""
  const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (ymd) return raw
  const dmy = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`
  return ""
}

// ─── Row → Applicant ─────────────────────────────────────────────────────────

export function rowToApplicant(row: string[], headers: string[]): Applicant | RowToApplicantError {
  // Validate required headers exist.
  for (const req of REQUIRED_SHEET_HEADERS) {
    if (!headers.includes(req as string)) {
      return { error: `Missing required header: ${req}`, column: req as string }
    }
  }

  const get = (col: string): string => {
    const idx = headers.indexOf(col)
    return idx !== -1 ? (row[idx] ?? "").trim() : ""
  }

  // Required fields — reject if empty.
  const id = get("id")
  if (!id) return { error: "Empty required field: id" }

  const name = get("name")
  if (!name) return { error: "Empty required field: name" }

  const email = get("email")
  if (!email) return { error: "Empty required field: email" }

  const position1 = get("position1")
  if (!position1) return { error: "Empty required field: position1" }

  const submittedAt = get("submittedAt")
  if (!submittedAt) return { error: "Empty required field: submittedAt" }

  const batchRaw = get("batch")
  const batch = Number(batchRaw)
  if (!batchRaw || Number.isNaN(batch)) {
    return { error: `Invalid numeric field: batch = "${batchRaw}"`, column: "batch" }
  }

  // Optional numeric fields.
  const gpaRaw = get("gpa")
  const gpa = gpaRaw ? Number(gpaRaw) : 0
  if (gpaRaw && Number.isNaN(gpa)) {
    return { error: `Invalid numeric field: gpa = "${gpaRaw}"`, column: "gpa" }
  }

  const sourceBatchRaw = get("sourceBatch")
  const sourceBatch = sourceBatchRaw ? Number(sourceBatchRaw) : undefined
  if (sourceBatchRaw && Number.isNaN(sourceBatch)) {
    return { error: `Invalid numeric field: sourceBatch = "${sourceBatchRaw}"`, column: "sourceBatch" }
  }

  // Boolean fields — truthy strings.
  const parseBool = (v: string): boolean => ["true", "1", "yes", "y"].includes(v.toLowerCase())

  const portfolioLinksRaw = get("portfolioLinks")

  const applicant: Applicant = {
    id,
    name,
    email,
    dob: normDate(get("dob")),
    phone: get("phone"),
    position1,
    position2: get("position2") || undefined,
    university: get("university"),
    yearOfStudy: get("yearOfStudy"),
    major: get("major"),
    gpa,
    hasExperience: parseBool(get("hasExperience")),
    academicFile: get("academicFile") || undefined,
    experienceDesc: get("experienceDesc") || undefined,
    portfolio: get("portfolio") || undefined,
    portfolioLinks: portfolioLinksRaw ? portfolioLinksRaw.split(",").map(s => s.trim()) : undefined,
    fullTime: parseBool(get("fullTime")),
    internshipCommitment: get("internshipCommitment") || undefined,
    postInternshipFullTime: get("postInternshipFullTime") || undefined,
    discoveryChannel: get("discoveryChannel"),
    internalReferrer: get("internalReferrer") || undefined,
    sunStudioMessage: get("sunStudioMessage") || undefined,
    submittedAt,
    typeformSubmittedAt: get("typeformSubmittedAt") || undefined,
    typeformToken: get("typeformToken") || undefined,
    batch,
    sourceBatch,
    sourcePic: get("sourcePic") || undefined,
    sourcePositions: get("sourcePositions") || undefined,
    screeningNote: get("screeningNote") || undefined,
    pic: get("pic") || undefined,
    round1Result: get("round1Result") || undefined,
    round1Notes: get("round1Notes") || undefined,
    round2Result: get("round2Result") || undefined,
    note: get("note") || undefined,
  }

  return applicant
}

// ─── Applicant → Row ─────────────────────────────────────────────────────────

export function applicantToRow(a: Applicant, headers: string[]): string[] {
  const stringify = (v: unknown): string => {
    if (v === undefined || v === null) return ""
    if (Array.isArray(v)) return v.join(",")
    if (typeof v === "boolean") return v ? "true" : "false"
    return String(v)
  }

  return headers.map(col => stringify(a[col as keyof Applicant]))
}
