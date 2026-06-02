"use client"

import { useEffect } from "react"
import { RefreshCw, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WorkspaceErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Workspace-level error boundary. Renders when any component inside the
 * (workspace) route group throws an unhandled exception. Shows a branded
 * recovery screen instead of a blank page.
 */
export default function WorkspaceError({ error, reset }: WorkspaceErrorProps) {
  useEffect(() => {
    console.error("[WorkspaceError]", error)
  }, [error])

  return (
    <main className="bg-background grid min-h-dvh place-items-center px-4">
      <div className="border-foreground/10 w-full max-w-md space-y-4 rounded-3xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-100 text-red-600">
          <RefreshCw className="size-6" aria-hidden />
        </div>
        <h1 className="text-h1 text-foreground font-semibold">Something went wrong</h1>
        <p className="text-muted-foreground text-sm leading-6">
          An unexpected error occurred in the workspace. Try refreshing — if the issue continues, sign out and back in.
        </p>
        {error.digest ? <p className="text-muted-foreground font-mono text-xs">ref: {error.digest}</p> : null}
        <div className="flex flex-col gap-2">
          <Button onClick={reset} className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full rounded-lg">
            <RefreshCw className="size-4" />
            Try again
          </Button>
          <Button
            onClick={() => {
              window.location.href = "/login"
            }}
            variant="outline"
            className="h-11 w-full rounded-lg"
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </div>
    </main>
  )
}
