"use client"

import { useRef, useState, type ClipboardEvent, type FormEvent } from "react"
import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"

interface OtpFormProps {
  onSuccess?: () => void
}

const OTP_LENGTH = 6

export function OtpForm({ onSuccess }: OtpFormProps) {
  const [digits, setDigits] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ""))
  const [error, setError] = useState("")
  const refs = useRef<Array<HTMLInputElement | null>>([])

  function updateDigit(index: number, value: string) {
    const nextValue = value.replace(/\D/g, "").slice(-1)
    const nextDigits = [...digits]
    nextDigits[index] = nextValue
    setDigits(nextDigits)
    setError("")

    if (nextValue && index < OTP_LENGTH - 1) refs.current[index + 1]?.focus()
  }

  function pasteDigits(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault()
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH)
    if (!pasted) return

    const nextDigits = Array.from({ length: OTP_LENGTH }, (_, index) => pasted[index] ?? "")
    setDigits(nextDigits)
    refs.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus()
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const code = digits.join("")

    if (code.length !== OTP_LENGTH) {
      setError("Enter the 6-digit code")
      return
    }

    onSuccess?.()
  }

  return (
    <form className="space-y-5" onSubmit={submit}>
      <div className="grid grid-cols-6 gap-2" aria-label="Verification code">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={node => {
              refs.current[index] = node
            }}
            aria-label={`Digit ${index + 1}`}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={event => updateDigit(index, event.target.value)}
            onPaste={pasteDigits}
            className="h-12 rounded-lg border border-foreground/15 bg-transparent text-center text-lg font-semibold transition outline-none focus:border-primary focus:ring-3 focus:ring-primary/20"
          />
        ))}
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <ActionTooltip label="Verify code">
        <Button
          type="submit"
          className="h-11 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <ShieldCheck className="size-4" />
          Verify
        </Button>
      </ActionTooltip>
    </form>
  )
}
