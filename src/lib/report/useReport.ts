"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { mockApplicants } from "@/lib/mockData"
import { buildReportSections } from "./reportTemplate"
import type { ReportSection } from "./types"

const REVEAL_DELAY_MS = 350

export function useReport() {
  const [sections, setSections] = useState<ReportSection[]>([])
  const [pending, setPending] = useState(false)
  const abortRef = useRef(false)
  const lastIdsRef = useRef<string[]>([])

  useEffect(() => {
    return () => {
      abortRef.current = true
    }
  }, [])

  const generate = useCallback(async (pinnedIds: string[]) => {
    abortRef.current = false
    lastIdsRef.current = pinnedIds
    setPending(true)
    setSections([])

    const candidates = pinnedIds
      .map(id => mockApplicants.find(item => item.id === id))
      .filter((item): item is (typeof mockApplicants)[number] => Boolean(item))
    const next = buildReportSections(candidates)

    for (const section of next) {
      if (abortRef.current) break
      await new Promise(resolve => setTimeout(resolve, REVEAL_DELAY_MS))
      if (abortRef.current) break
      setSections(prev => [...prev, section])
    }

    setPending(false)
  }, [])

  const abort = useCallback(() => {
    abortRef.current = true
    setPending(false)
  }, [])

  const regenerate = useCallback(() => {
    abort()
    void generate(lastIdsRef.current)
  }, [abort, generate])

  return { sections, generate, regenerate, abort, pending }
}
