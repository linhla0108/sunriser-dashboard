import { describe, expect, it } from "vitest"
import * as XLSX from "xlsx"
import {
  addColumnsToParsedDataset,
  analyzeUploadDataset,
  mapUploadDatasetToApplicants,
  parseUploadFile,
} from "../parseUploadFile"

function textFile(name: string, text: string, type = "text/plain") {
  return new File([text], name, { type })
}

function workbookFile(name: string, rows: unknown[][]) {
  const workbook = XLSX.utils.book_new()
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(workbook, sheet, "SUN.RISER 2026")
  const data = XLSX.write(workbook, { bookType: "xlsx", type: "array" }) as ArrayBuffer
  return new File([data], name, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}

describe("parseUploadFile", () => {
  it("parses CSV headers and row values including quoted commas", async () => {
    const dataset = await parseUploadFile(
      textFile("candidates.csv", 'Name,Email,GPA\n"Nguyen, An",an@example.com,8.5\nTran B,b@example.com,7.9', "text/csv")
    )

    expect(dataset.columns).toEqual(["Name", "Email", "GPA"])
    expect(dataset.rowCount).toBe(2)
    expect(dataset.rows[0].values).toEqual({
      Name: "Nguyen, An",
      Email: "an@example.com",
      GPA: 8.5,
    })
    expect(dataset.rows[1].values.Email).toBe("b@example.com")
  })

  it("parses TSV headers and values", async () => {
    const dataset = await parseUploadFile(textFile("candidates.tsv", "Name\tPhone\tPosition\nLe A\t0901\tAI Engineering Intern", "text/tab-separated-values"))

    expect(dataset.columns).toEqual(["Name", "Phone", "Position"])
    expect(dataset.rows[0].values.Phone).toBe("0901")
    expect(dataset.rows[0].values.Position).toBe("AI Engineering Intern")
  })

  it("parses XLSX sheets with sheet metadata and row values", async () => {
    const dataset = await parseUploadFile(
      workbookFile("sunriser.xlsx", [
        ["Full name", "Email", "Position 1", "GPA"],
        ["Pham Thi C", "c@example.com", "Data Analysis Intern", 9.1],
      ])
    )

    expect(dataset.sheetNames).toEqual(["SUN.RISER 2026"])
    expect(dataset.activeSheetName).toBe("SUN.RISER 2026")
    expect(dataset.columns).toEqual(["Full name", "Email", "Position 1", "GPA"])
    expect(dataset.rows[0].values["Full name"]).toBe("Pham Thi C")
    expect(dataset.rows[0].values.GPA).toBe(9.1)
  })

  it("adds missing columns and re-analyzes the candidate field coverage", async () => {
    const dataset = await parseUploadFile(textFile("candidates.csv", "Name,Email\nLe A,a@example.com", "text/csv"))
    const withAddedColumn = addColumnsToParsedDataset(dataset, ["Round 1 Notes"])
    const analysis = analyzeUploadDataset(withAddedColumn)

    expect(withAddedColumn.columns).toContain("Round 1 Notes")
    expect(withAddedColumn.rows[0].values["Round 1 Notes"]).toBeNull()
    expect(analysis.matchedFields.round1Notes).toBe("Round 1 Notes")
  })

  it("maps parsed rows into candidate records while preserving the source values", async () => {
    const dataset = await parseUploadFile(
      textFile("candidates.csv", "Name,Email,Phone,Position 1,GPA\nLe A,a@example.com,0901,AI Engineering Intern,8.8", "text/csv")
    )

    const candidates = mapUploadDatasetToApplicants(dataset)

    expect(candidates).toHaveLength(1)
    expect(candidates[0]).toMatchObject({
      name: "Le A",
      email: "a@example.com",
      phone: "0901",
      position1: "AI Engineering Intern",
      gpa: 8.8,
    })
  })
})
