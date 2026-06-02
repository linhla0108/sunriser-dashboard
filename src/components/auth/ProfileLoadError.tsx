"use client"

import { RefreshCw, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/useAuth"

export function ProfileLoadError() {
  const { signOut } = useAuth()

  return (
    <main className="bg-background grid min-h-dvh place-items-center px-4">
      <div className="border-foreground/10 w-full max-w-md space-y-4 rounded-3xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-100 text-red-600">
          <RefreshCw className="size-6" aria-hidden />
        </div>
        <h1 className="text-h1 text-foreground font-semibold">Connection problem</h1>
        <p className="text-muted-foreground text-sm leading-6">
          We couldn&apos;t load your workspace profile. This is usually a temporary network issue. Try refreshing the page — your account is fine.
        </p>
        <div className="flex flex-col gap-2">
          <Button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full rounded-lg">
            <RefreshCw className="size-4" />
            Refresh page
          </Button>
          <Button onClick={() => void signOut()} variant="outline" className="h-11 w-full rounded-lg">
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </div>
    </main>
  )
}
