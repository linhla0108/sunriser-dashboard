"use client"

import { useState, type FormEvent } from "react"
import { MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ActionTooltip } from "@/components/common/ActionTooltip"
import { createClient } from "@/lib/supabase/client"

export function ForgotForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage("")
    setError("")
    setPending(true)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    setPending(false)

    if (resetError) {
      // 429: rate limit — show a friendly message instead of the raw SDK string
      setError(
        resetError.status === 429
          ? "Too many attempts. Please wait a few minutes before trying again."
          : resetError.message
      )
      return
    }

    setMessage(`Reset instructions sent to ${email}`)
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="space-y-2">
        <Label htmlFor="v2-forgot-email">Email</Label>
        <Input id="v2-forgot-email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required />
      </div>

      {message ? (
        <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <ActionTooltip label="Send reset instructions">
        <Button type="submit" disabled={pending} className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full rounded-lg">
          <MailCheck className="size-4" />
          {pending ? "Sending reset link" : "Send reset link"}
        </Button>
      </ActionTooltip>
    </form>
  )
}
