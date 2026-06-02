export interface Applicant {
  id: string
  name: string
  dob: string
  email: string
  phone: string
  position1: string
  position2?: string
  university: string
  yearOfStudy: string
  major: string
  gpa: number
  hasExperience: boolean
  academicFile?: string
  experienceDesc?: string
  portfolio?: string
  portfolioLinks?: string[]
  fullTime: boolean
  internshipCommitment?: string
  postInternshipFullTime?: string
  discoveryChannel: string
  internalReferrer?: string
  sunStudioMessage?: string
  submittedAt: string
  typeformSubmittedAt?: string
  typeformToken?: string
  batch: number
  sourceBatch?: number
  sourcePic?: string
  sourcePositions?: string
  screeningNote?: string
  pic?: string
  round1Result?: string
  round1Notes?: string
  round2Result?: string
  note?: string
}

export type CandidateTypeformSupplement = Pick<Applicant, "id"> &
  Partial<
    Pick<
      Applicant,
      | "academicFile"
      | "hasExperience"
      | "experienceDesc"
      | "portfolio"
      | "portfolioLinks"
      | "internshipCommitment"
      | "postInternshipFullTime"
      | "discoveryChannel"
      | "internalReferrer"
      | "sunStudioMessage"
      | "typeformSubmittedAt"
      | "typeformToken"
      | "sourceBatch"
      | "sourcePic"
      | "sourcePositions"
      | "screeningNote"
      | "note"
    >
  >

export type Position =
  | "AI Engineering Intern"
  | "Data Analysis Intern"
  | "Game Design Intern"
  | "Unity Development Intern"
  | "Game User Acquisition Intern"
  | "Human Resources Intern"
  | "Game Quality Assurance Intern"

export interface DashboardStats {
  totalApplicants: number
  batch1Count: number
  batch2Count: number
  batch3Count: number
  passedRound1: number
  failedRound1: number
  waitingListRound1: number
  passRate: number
  avgGpa: number
}

export interface TimelineEntry {
  id: string
  startDate: string
  endDate?: string
  batch: string
  todo: string
  pic: string
  note: string
}

export const TIMELINE_BATCHES = ["1", "2", "3", "HR", "General"] as const

export type TimelineBatch = (typeof TIMELINE_BATCHES)[number]

export function normalizeTimelineBatch(value: string): TimelineBatch {
  const trimmed = value.trim()
  if (trimmed === "") return "General"
  return (TIMELINE_BATCHES as readonly string[]).includes(trimmed) ? (trimmed as TimelineBatch) : "General"
}
