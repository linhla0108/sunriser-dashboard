import type { V2User } from "./types"

export const MOCK_USERS: Array<V2User & { password: string }> = [
  {
    id: "u_admin",
    email: "admin@sunriser.com",
    password: "admin123",
    role: "admin",
    name: "Linh Admin",
  },
  {
    id: "u_member",
    email: "member@sunriser.com",
    password: "member123",
    role: "member",
    name: "Recruiter Member",
  },
]
