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
  experienceDesc?: string
  portfolio?: string
  fullTime: boolean
  discoveryChannel: string
  submittedAt: string
  batch: number
  pic?: string
  round1Result?: string
  round1Notes?: string
  round2Result?: string
}

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
