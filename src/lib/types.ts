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
  round1Result?: 'Passed' | 'Failed' | 'Waiting list'
  round1Notes?: string
  round2Result?: string
}

export type Position =
  | 'AI Engineering Intern'
  | 'Data Analysis Intern'
  | 'Game Design Intern'
  | 'Unity Development Intern'
  | 'Game User Acquisition Intern'
  | 'Human Resources Intern'
  | 'Game Quality Assurance Intern'

export type Round1Result = 'Passed' | 'Failed' | 'Waiting list'

export interface DashboardStats {
  totalApplicants: number
  passedRound1: number
  passRate: number
  avgGpa: number
}
