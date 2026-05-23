"use client"

import { createContext, useContext, useMemo, useState } from "react"
import type { Applicant } from "@/lib/types"
import type { ParsedUploadDataset, UploadAnalysis } from "./parseUploadFile"

export interface UploadSession {
  id: string
  confirmedAt: string
  dataset: ParsedUploadDataset
  analysis: UploadAnalysis
  applicants: Applicant[]
}

interface UploadSessionContextValue {
  uploadSession: UploadSession | null
  setUploadSession: (session: UploadSession | null) => void
  clearUploadSession: () => void
}

const UploadSessionContext = createContext<UploadSessionContextValue | null>(null)

export function UploadSessionProvider({ children }: { children: React.ReactNode }) {
  const [uploadSession, setUploadSession] = useState<UploadSession | null>(null)

  const value = useMemo(
    () => ({
      uploadSession,
      setUploadSession,
      clearUploadSession: () => setUploadSession(null),
    }),
    [uploadSession]
  )

  return <UploadSessionContext.Provider value={value}>{children}</UploadSessionContext.Provider>
}

export function useUploadSession() {
  const value = useContext(UploadSessionContext)
  if (!value) throw new Error("useUploadSession must be used within UploadSessionProvider")
  return value
}
