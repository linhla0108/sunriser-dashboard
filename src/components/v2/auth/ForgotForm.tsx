"use client"

import { useState, type FormEvent } from "react"
import { MailCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"

export function ForgotForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
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

      <ActionTooltip label="Send reset instructions">
        <Button
          type="submit"
          className="h-11 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <MailCheck className="size-4" />
          Send reset link
        </Button>
      </ActionTooltip>
    </form>
  )
}
