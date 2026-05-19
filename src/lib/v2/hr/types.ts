export type HrRole = "HR Manager" | "Recruiter" | "Coordinator" | "Analyst" | "Intern"
export type HrStatus = "active" | "inactive"

export interface HrStaff {
  id: string
  name: string
  email: string
  role: HrRole
  department: string
  status: HrStatus
  joinedAt: string
  avatarInitials: string
}
