import { describe, it, expect } from "vitest"
import { rowToApplicant, applicantToRow } from "../mapping"
import type { Applicant } from "@/lib/types"

const BASE_HEADERS = [
  "id",
  "name",
  "email",
  "position1",
  "batch",
  "submittedAt",
  "dob",
  "phone",
  "position2",
  "university",
  "yearOfStudy",
  "major",
  "gpa",
  "hasExperience",
  "fullTime",
  "discoveryChannel",
  "pic",
  "round1Result",
  "round2Result",
  "note",
]

const FIXTURE_APPLICANT: Applicant = {
  id: "a001",
  name: "Nguyen Van A",
  email: "a@example.com",
  dob: "2000-01-15",
  phone: "0901234567",
  position1: "AI Engineering Intern",
  university: "HCMUT",
  yearOfStudy: "3",
  major: "Computer Science",
  gpa: 3.5,
  hasExperience: false,
  fullTime: true,
  discoveryChannel: "Facebook",
  submittedAt: "2026-05-01",
  batch: 3,
}

function makeRow(overrides: Record<string, string> = {}): string[] {
  const defaults: Record<string, string> = {
    id: "a001",
    name: "Nguyen Van A",
    email: "a@example.com",
    position1: "AI Engineering Intern",
    batch: "3",
    submittedAt: "2026-05-01",
    dob: "2000-01-15",
    phone: "0901234567",
    university: "HCMUT",
    yearOfStudy: "3",
    major: "Computer Science",
    gpa: "3.5",
    hasExperience: "false",
    fullTime: "true",
    discoveryChannel: "Facebook",
    pic: "",
    round1Result: "",
    round2Result: "",
    note: "",
    position2: "",
  }
  const merged = { ...defaults, ...overrides }
  return BASE_HEADERS.map(h => merged[h] ?? "")
}

describe("rowToApplicant", () => {
  it("parses a valid row into an Applicant", () => {
    const result = rowToApplicant(makeRow(), BASE_HEADERS)
    expect("error" in result).toBe(false)
    const a = result as Applicant
    expect(a.id).toBe("a001")
    expect(a.gpa).toBe(3.5)
    expect(a.batch).toBe(3)
    expect(a.hasExperience).toBe(false)
    expect(a.fullTime).toBe(true)
  })

  it("returns error for missing required header", () => {
    const headersWithoutId = BASE_HEADERS.filter(h => h !== "id")
    const result = rowToApplicant(makeRow(), headersWithoutId)
    expect("error" in result).toBe(true)
    expect((result as { error: string }).error).toContain("id")
  })

  it("returns error when required field is empty", () => {
    const result = rowToApplicant(makeRow({ name: "" }), BASE_HEADERS)
    expect("error" in result).toBe(true)
    expect((result as { error: string }).error).toContain("name")
  })

  it("returns error for non-numeric batch", () => {
    const result = rowToApplicant(makeRow({ batch: "abc" }), BASE_HEADERS)
    expect("error" in result).toBe(true)
    expect((result as { error: string }).error).toContain("batch")
  })

  it("normalises dd/mm/yyyy date to yyyy-mm-dd", () => {
    const result = rowToApplicant(makeRow({ dob: "15/01/2000" }), BASE_HEADERS)
    expect("error" in result).toBe(false)
    expect((result as Applicant).dob).toBe("2000-01-15")
  })

  it("ignores extra columns in the row", () => {
    const extHeaders = [...BASE_HEADERS, "unknownColumn"]
    const extRow = [...makeRow(), "extra-value"]
    const result = rowToApplicant(extRow, extHeaders)
    expect("error" in result).toBe(false)
  })
})

describe("applicantToRow", () => {
  it("produces a row of the same length as headers", () => {
    const row = applicantToRow(FIXTURE_APPLICANT, BASE_HEADERS)
    expect(row.length).toBe(BASE_HEADERS.length)
  })

  it('serialises boolean fields as "true"/"false"', () => {
    const row = applicantToRow(FIXTURE_APPLICANT, BASE_HEADERS)
    const hasExpIdx = BASE_HEADERS.indexOf("hasExperience")
    expect(row[hasExpIdx]).toBe("false")
  })

  it("serialises undefined optional fields as empty string", () => {
    const row = applicantToRow(FIXTURE_APPLICANT, BASE_HEADERS)
    const noteIdx = BASE_HEADERS.indexOf("note")
    expect(row[noteIdx]).toBe("")
  })
})

describe("round-trip", () => {
  it("rowToApplicant(applicantToRow(a)) reproduces the original", () => {
    const row = applicantToRow(FIXTURE_APPLICANT, BASE_HEADERS)
    const result = rowToApplicant(row, BASE_HEADERS)
    expect("error" in result).toBe(false)
    const a = result as Applicant
    expect(a.id).toBe(FIXTURE_APPLICANT.id)
    expect(a.name).toBe(FIXTURE_APPLICANT.name)
    expect(a.gpa).toBe(FIXTURE_APPLICANT.gpa)
    expect(a.batch).toBe(FIXTURE_APPLICANT.batch)
    expect(a.hasExperience).toBe(FIXTURE_APPLICANT.hasExperience)
    expect(a.fullTime).toBe(FIXTURE_APPLICANT.fullTime)
  })
})
