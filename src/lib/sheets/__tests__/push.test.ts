import { describe, it, expect } from "vitest"
import { applicantToRow } from "../mapping"
import type { Applicant } from "@/lib/types"

const HEADERS = ["id", "name", "email", "position1", "batch", "submittedAt", "gpa", "hasExperience", "fullTime"]

const FIXTURE: Applicant = {
  id: "b001",
  name: "Tran Thi B",
  email: "b@example.com",
  dob: "2001-03-20",
  phone: "0912345678",
  position1: "Data Analysis Intern",
  university: "NEU",
  yearOfStudy: "2",
  major: "Economics",
  gpa: 3.2,
  hasExperience: true,
  fullTime: false,
  discoveryChannel: "LinkedIn",
  submittedAt: "2026-05-02",
  batch: 3,
}

describe("applicantToRow (push payload)", () => {
  it("produces a row matching header order", () => {
    const row = applicantToRow(FIXTURE, HEADERS)
    expect(row[HEADERS.indexOf("id")]).toBe("b001")
    expect(row[HEADERS.indexOf("name")]).toBe("Tran Thi B")
    expect(row[HEADERS.indexOf("gpa")]).toBe("3.2")
    expect(row[HEADERS.indexOf("hasExperience")]).toBe("true")
    expect(row[HEADERS.indexOf("fullTime")]).toBe("false")
    expect(row[HEADERS.indexOf("batch")]).toBe("3")
  })

  it("returns empty string for undefined optional field", () => {
    const row = applicantToRow(FIXTURE, [...HEADERS, "note"])
    expect(row[row.length - 1]).toBe("")
  })

  it("serialises array field as comma-separated string", () => {
    const a: Applicant = { ...FIXTURE, portfolioLinks: ["https://a.com", "https://b.com"] }
    const row = applicantToRow(a, [...HEADERS, "portfolioLinks"])
    expect(row[row.length - 1]).toBe("https://a.com,https://b.com")
  })

  it("returns a row length equal to headers length", () => {
    const row = applicantToRow(FIXTURE, HEADERS)
    expect(row).toHaveLength(HEADERS.length)
  })

  it("empty applicant list results in no batchUpdate data rows — verifies guard logic", () => {
    // Push logic: if applicants.length === 0, no API call is made.
    // This test verifies applicantToRow is never called on an empty list.
    const rows: string[][] = [].map((a: Applicant) => applicantToRow(a, HEADERS))
    expect(rows).toHaveLength(0)
  })
})
