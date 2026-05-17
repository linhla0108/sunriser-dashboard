"use client"

import { useState, type FormEvent } from "react"
import { CheckCircle2, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { useAuth } from "@/lib/v2/auth/useAuth"
import { MOCK_USERS } from "@/lib/v2/auth/mockUsers"

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")

    const result = await signIn(email, password)
    setPending(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    onSuccess?.()
  }

  function fillQuickLogin(user: (typeof MOCK_USERS)[number]) {
    setEmail(user.email)
    setPassword(user.password)
    setError("")
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="v2-email">Email</Label>
        <Input
          id="v2-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="admin@sunriser.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="v2-password">Password</Label>
        <Input
          id="v2-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          placeholder="admin123"
          required
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        {MOCK_USERS.map(user => (
          <ActionTooltip key={user.id} label={`Use ${user.role} demo login`}>
            <button
              type="button"
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--v2-ink)]/10 px-3 text-sm font-medium text-[var(--v2-ink)] transition hover:bg-[var(--v2-ink)]/5"
              onClick={() => fillQuickLogin(user)}
            >
              <CheckCircle2 className="size-4 text-[var(--v2-primary)]" />
              {user.role === "admin" ? "Admin" : "Member"}
            </button>
          </ActionTooltip>
        ))}
      </div>

      <ActionTooltip label="Sign in to workspace">
        <Button
          type="submit"
          className="h-11 w-full rounded-[var(--v2-radius-button)] bg-[var(--v2-primary)] text-white hover:bg-[var(--v2-primary-hover)]"
          disabled={pending}
        >
          <LogIn className="size-4" />
          {pending ? "Signing in" : "Sign in"}
        </Button>
      </ActionTooltip>
    </form>
  )
}
