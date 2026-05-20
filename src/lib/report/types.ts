export type ReportSectionId = "summary" | "top" | "insights" | "recommendations"

export interface ReportSection {
  id: ReportSectionId
  title: string
  content: string
}

export interface ReportSnapshot {
  shareId: string
  generatedAt: string
  sections: ReportSection[]
  sourceApplicants: string[]
  aliases?: string[]
}
