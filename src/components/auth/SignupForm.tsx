import { LockKeyhole } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { ActionTooltip } from "@/components/common/ActionTooltip"

export function SignupForm() {
  return (
    <div className="space-y-5">
      <div className="border-foreground/10 bg-foreground/[0.03] rounded-lg border px-4 py-4">
        <LockKeyhole className="text-primary mb-3 size-5" />
        <p role="status" className="text-foreground text-sm font-medium">
          Account creation is disabled.
        </p>
        <p className="text-muted-foreground mt-1 text-sm leading-6">Ask a workspace admin for an approved SUN.RISER account.</p>
      </div>

      <ActionTooltip label="Return to sign in">
        <Link
          href="/login"
          className={buttonVariants({
            className: "bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full rounded-lg",
          })}
        >
          Back to sign in
        </Link>
      </ActionTooltip>
    </div>
  )
}
