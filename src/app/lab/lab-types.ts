export type LabView = 'table' | 'kanban' | 'gallery'

export interface Scorecard {
  cvQuality: number
  experience: number
  gpaScore: number
  communication: number
  notes: string
}

export interface Activity {
  id: string
  timestamp: string
  action: string
  detail?: string
  user: string
}

export interface SavedView {
  id: string
  name: string
  view: LabView
  search: string
  position: string
  batch: string
  round1: string
  createdAt: string
}

export type FilterField =
  | 'position1'
  | 'batch'
  | 'gpa'
  | 'university'
  | 'round1Result'
  | 'hasExperience'
  | 'fullTime'
  | 'yearOfStudy'

export type FilterOperator = 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte'

export interface FilterCondition {
  id: string
  field: FilterField
  operator: FilterOperator
  value: string
}
