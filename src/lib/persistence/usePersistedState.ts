"use client"

import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import type { ZodSchema } from "zod"

function readStoredValue<T>(key: string, defaultValue: T, schema?: ZodSchema<T>): T {
  if (typeof window === "undefined") return defaultValue

  try {
    const raw = window.localStorage.getItem(key)
    if (raw == null) return defaultValue

    const parsed: unknown = JSON.parse(raw)
    if (!schema) return parsed as T

    const result = schema.safeParse(parsed)
    return result.success ? result.data : defaultValue
  } catch {
    return defaultValue
  }
}

export function usePersistedState<T>(key: string, defaultValue: T, schema?: ZodSchema<T>): readonly [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => readStoredValue(key, defaultValue, schema))

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Persistence is best-effort; keep UI state working when storage is unavailable.
    }
  }, [key, value])

  return [value, setValue] as const
}
