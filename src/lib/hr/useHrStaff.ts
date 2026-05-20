import { useReducer, useMemo } from "react"
import { mockHrStaff } from "./mockHrStaff"
import type { HrStaff, HrRole, HrStatus } from "./types"

type Action =
  | { type: "CREATE"; payload: HrStaff }
  | { type: "UPDATE"; payload: HrStaff }
  | { type: "DELETE"; id: string }
  | { type: "TOGGLE_STATUS"; id: string }

function reducer(state: HrStaff[], action: Action): HrStaff[] {
  switch (action.type) {
    case "CREATE":
      return [action.payload, ...state]
    case "UPDATE":
      return state.map(s => (s.id === action.payload.id ? action.payload : s))
    case "DELETE":
      return state.filter(s => s.id !== action.id)
    case "TOGGLE_STATUS":
      return state.map(s => s.id === action.id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s)
    default:
      return state
  }
}

export function useHrStaff(search = "", roleFilter: HrRole | "all" = "all", statusFilter: HrStatus | "all" = "all") {
  const [staff, dispatch] = useReducer(reducer, mockHrStaff)

  const filtered = useMemo(() => {
    return staff.filter(s => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === "all" || s.role === roleFilter
      const matchStatus = statusFilter === "all" || s.status === statusFilter
      return matchSearch && matchRole && matchStatus
    })
  }, [staff, search, roleFilter, statusFilter])

  function createStaff(data: Omit<HrStaff, "id">) {
    dispatch({ type: "CREATE", payload: { ...data, id: `hr_${Date.now()}` } })
  }

  function updateStaff(updated: HrStaff) {
    dispatch({ type: "UPDATE", payload: updated })
  }

  function deleteStaff(id: string) {
    dispatch({ type: "DELETE", id })
  }

  function toggleStatus(id: string) {
    dispatch({ type: "TOGGLE_STATUS", id })
  }

  const activeCount = staff.filter(s => s.status === "active").length
  const inactiveCount = staff.filter(s => s.status === "inactive").length

  return { staff, filtered, activeCount, inactiveCount, createStaff, updateStaff, deleteStaff, toggleStatus }
}
