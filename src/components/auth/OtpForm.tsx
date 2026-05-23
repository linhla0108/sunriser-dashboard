"use client"

import { ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ActionTooltip } from "@/components/common/ActionTooltip"

interface OtpFormProps {
  onSuccess?: () => void
}

export function OtpForm({ onSuccess }: OtpFormProps) {
  return (
    <div className="space-y-5">
      <p role="status" className="rounded-lg bg-green-50 px-3 py-2 text-sm leading-6 text-green-700">
        Supabase will send a confirmation link to your email. Open that link, then return to sign in.
      </p>
      <ActionTooltip label="Verify code">
        <Button
          type="button"
          className="h-11 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onSuccess}
        >
          <ShieldCheck className="size-4" />
          Back to sign in
        </Button>
      </ActionTooltip>
    </div>
  )
}
