"use client"

import { useEffect, useState, type FormEvent } from "react"
import { LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ActionTooltip } from "@/components/common/ActionTooltip"
import { useAuth } from "@/lib/auth/useAuth"

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { signIn, user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)
  const [remember, setRemember] = useState(true)
  const [readyToNavigate, setReadyToNavigate] = useState(false)

  // Navigate only after React commits the auth state — avoids RequireAuth race condition
  useEffect(() => {
    if (readyToNavigate && user) onSuccess?.()
  }, [readyToNavigate, user, onSuccess])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError("")

    const result = await signIn(email, password, { remember })
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
          placeholder="name@sunriser.com"
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
          placeholder="Your password"
          required
        />
      </div>

      <label htmlFor="v2-remember" className="flex items-start gap-3 rounded-lg border border-foreground/10 px-3 py-2">
        <Checkbox
          id="v2-remember"
          checked={remember}
          onCheckedChange={checked => setRemember(checked === true)}
          aria-label="Remember me for 6 days"
          className="mt-0.5"
        />
        <span className="grid gap-0.5">
          <span className="text-sm font-medium text-foreground">Remember me</span>
          <span className="text-xs leading-5 text-muted-foreground">Keep this browser signed in for 6 days.</span>
        </span>
      </label>

      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <ActionTooltip label="Sign in to workspace">
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full rounded-lg" disabled={pending}>
          <LogIn className="size-4" />
          {pending ? "Signing in" : "Sign in"}
        </Button>
      </ActionTooltip>
    </form>
  )
}
