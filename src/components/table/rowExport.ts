import type { Applicant } from "@/lib/types"

export function exportRowCSV(applicant: Applicant) {
  const headers = [
    "Name",
    "Email",
    "Phone",
    "Position",
    "University",
    "GPA",
    "Academic File",
    "Experience Description",
    "Portfolio",
    "Message",
    "Note",
    "Batch",
    "PIC",
    "Round 1",
    "Round 2",
  ]
  const row = [
    applicant.name,
    applicant.email,
    applicant.phone,
    applicant.position1,
    applicant.university,
    applicant.gpa,
    applicant.academicFile ?? "",
    applicant.experienceDesc ?? "",
    applicant.portfolio ?? "",
    applicant.sunStudioMessage ?? "",
    applicant.note ?? "",
    applicant.batch,
    applicant.pic ?? "",
    applicant.round1Result ?? "",
    applicant.round2Result ?? "",
  ]
  const csv = [headers, row].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${applicant.name.replace(/\s+/g, "-")}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
