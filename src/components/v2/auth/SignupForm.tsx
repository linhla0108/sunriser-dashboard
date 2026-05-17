"use client"

import { useState, type FormEvent } from "react"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"

interface SignupFormProps {
  onSuccess?: () => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    onSuccess?.()
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="v2-signup-name">Name</Label>
        <Input id="v2-signup-name" value={name} onChange={event => setName(event.target.value)} autoComplete="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="v2-signup-email">Email</Label>
        <Input id="v2-signup-email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="v2-signup-password">Password</Label>
        <Input
          id="v2-signup-password"
          type="password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          autoComplete="new-password"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="v2-signup-confirm">Confirm password</Label>
        <Input
          id="v2-signup-confirm"
          type="password"
          value={confirmPassword}
          onChange={event => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          required
        />
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <ActionTooltip label="Create workspace account">
        <Button
          type="submit"
          className="h-11 w-full rounded-[var(--v2-radius-button)] bg-[var(--v2-primary)] text-white hover:bg-[var(--v2-primary-hover)]"
        >
          <UserPlus className="size-4" />
          Create account
        </Button>
      </ActionTooltip>
    </form>
  )
}
