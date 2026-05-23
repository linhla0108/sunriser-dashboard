import { LockKeyhole } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { ActionTooltip } from "@/components/common/ActionTooltip"

export function SignupForm() {
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-foreground/10 bg-foreground/[0.03] px-4 py-4">
        <LockKeyhole className="mb-3 size-5 text-primary" />
        <p role="status" className="text-sm font-medium text-foreground">
          Account creation is disabled.
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Ask a workspace admin for an approved SUN.RISER account.
        </p>
      </div>

      <ActionTooltip label="Return to sign in">
        <Link
          href="/login"
          className={buttonVariants({
            className: "h-11 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/90",
          })}
        >
          Back to sign in
        </Link>
      </ActionTooltip>
    </div>
  )
}
