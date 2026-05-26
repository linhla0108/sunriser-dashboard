"use client"

import { LogOut, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth/useAuth"

export function InactiveAccount() {
  const { signOut, user } = useAuth()

  return (
    <main className="bg-background grid min-h-dvh place-items-center px-4">
      <div className="border-foreground/10 w-full max-w-md space-y-4 rounded-3xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-amber-100 text-amber-700">
          <ShieldAlert className="size-6" aria-hidden />
        </div>
        <h1 className="text-h1 text-foreground font-semibold">Account inactive</h1>
        <p className="text-muted-foreground text-sm leading-6">
          Your access to SUN.RISER is currently disabled
          {user?.email ? (
            <>
              {" "}
              for <span className="text-foreground font-medium">{user.email}</span>
            </>
          ) : null}
          . Please contact a workspace admin to restore it.
        </p>
        <Button onClick={() => void signOut()} variant="outline" className="h-11 w-full rounded-lg">
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </main>
  )
}
