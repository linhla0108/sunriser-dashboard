/**
 * Tests that auth flows survive when localStorage/sessionStorage.setItem
 * throws (Safari private mode → SecurityError, quota exceeded → QuotaExceededError).
 *
 * Uses the global setup.ts mock for signInWithPassword so we only need to
 * intercept the storage writes.
 */
import { renderHook, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import React from "react"
import { AuthProvider } from "../AuthProvider"
import { useAuth } from "../useAuth"

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe("AuthProvider — storage unavailable (Safari private mode)", () => {
  beforeEach(() => {
    localStorage.clear()
    // Make localStorage.setItem throw on every call
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError", "QuotaExceededError")
    })
    // Make sessionStorage.setItem throw too
    vi.spyOn(window.sessionStorage, "setItem").mockImplementation(() => {
      throw new DOMException("SecurityError", "SecurityError")
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("signIn() returns ok:true even when localStorage.setItem throws", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    // Wait for initial auth resolution
    await waitFor(() => expect(result.current.loading).toBe(false))

    let signInResult: { ok: boolean; error?: string } | undefined
    await waitFor(async () => {
      signInResult = await result.current.signIn("admin@sunriser.com", "admin123", {
        remember: true,
      })
    })

    expect(signInResult?.ok).toBe(true)
  })

  it("signIn() with remember=false returns ok:true even when sessionStorage.setItem throws", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    let signInResult: { ok: boolean; error?: string } | undefined
    await waitFor(async () => {
      signInResult = await result.current.signIn("member@sunriser.com", "member123", {
        remember: false,
      })
    })

    expect(signInResult?.ok).toBe(true)
  })

  it("signOut() resolves without throwing when storage operations fail", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.loading).toBe(false))

    // Should not throw
    await expect(result.current.signOut()).resolves.toBeUndefined()
  })
})
