import type { Applicant } from "@/lib/types"
import type { ReportSection } from "./types"

export function buildReportSections(candidates: Applicant[]): ReportSection[] {
  const count = candidates.length
  const names = candidates.map(c => c.name)
  const avgGpa = count > 0 ? candidates.reduce((sum, c) => sum + c.gpa, 0) / count : 0
  const positions = Array.from(new Set(candidates.map(c => c.position1)))
  const positionCounts = candidates.reduce<Record<string, number>>((acc, c) => {
    acc[c.position1] = (acc[c.position1] ?? 0) + 1
    return acc
  }, {})
  const topPosition = Object.entries(positionCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const universities = Array.from(new Set(candidates.map(c => c.university)))
  const passed = candidates.filter(c => c.round1Result === "Passed").length

  return [
    {
      id: "summary",
      title: "Summary",
      content:
        count === 0
          ? "No pinned candidates were provided for this report."
          : `This report covers ${count} pinned candidate${count === 1 ? "" : "s"}: ${names.join(", ")}. Average GPA across the cohort is ${avgGpa.toFixed(2)}, spanning ${universities.length} institution${universities.length === 1 ? "" : "s"}.`,
    },
    {
      id: "top",
      title: "Top candidates",
      content:
        count === 0
          ? "Pin candidates from any view to populate this section."
          : candidates
              .slice()
              .sort((a, b) => b.gpa - a.gpa)
              .slice(0, 3)
              .map((c, i) => `${i + 1}. ${c.name} — ${c.position1} · GPA ${c.gpa.toFixed(2)} · ${c.university}`)
              .join("\n"),
    },
    {
      id: "insights",
      title: "Insights",
      content:
        count === 0
          ? "Insights will appear once pinned candidates exist."
          : `${passed} of ${count} cleared Round 1. Most represented role: ${topPosition ?? "—"} (${topPosition ? positionCounts[topPosition] : 0} of ${count}). Roles covered: ${positions.join(", ")}. ${universities.length > 1 ? "University diversity is healthy across the pinned set." : "Pinned candidates share a single university."}`,
    },
    {
      id: "recommendations",
      title: "Recommendations",
      content:
        count === 0
          ? "Add candidates to compare before generating a recommendation."
          : `Prioritize ${candidates
              .slice(0, Math.min(2, count))
              .map(c => c.name)
              .join(
                " and "
              )} for the next interview round. Cross-check Round 2 readiness with the assigned PIC and flag any candidates without a portfolio link before scheduling.`,
    },
  ]
}
