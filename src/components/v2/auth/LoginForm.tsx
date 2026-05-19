"use client"

import { useEffect, useState, type FormEvent } from "react"
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
  const { signIn, user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [readyToNavigate, setReadyToNavigate] = useState(false)

  // Navigate only after React commits the auth state — avoids RequireAuth race condition
  useEffect(() => {
    if (readyToNavigate && user) onSuccess?.()
  }, [readyToNavigate, user, onSuccess])

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

    setReadyToNavigate(true)
  }

  async function quickLogin(demoUser: (typeof MOCK_USERS)[number]) {
    setPending(true)
    setError("")
    const result = await signIn(demoUser.email, demoUser.password)
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setReadyToNavigate(true)
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
            <Button
              variant="plain"
              size="plain"
              type="button"
              className="border-foreground/10 text-foreground hover:bg-foreground/5 flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-medium transition"
              onClick={() => quickLogin(user)}
              disabled={pending}
            >
              <CheckCircle2 className="text-primary size-4" />
              {user.role === "admin" ? "Admin" : "Member"}
            </Button>
          </ActionTooltip>
        ))}
      </div>

      <ActionTooltip label="Sign in to workspace">
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full rounded-lg" disabled={pending}>
          <LogIn className="size-4" />
          {pending ? "Signing in" : "Sign in"}
        </Button>
      </ActionTooltip>
    </form>
  )
}
