import Image from "next/image"
import { cn } from "@/lib/utils"

type AppLoadingVariant = "boot" | "auth" | "route"

interface AppLoadingScreenProps {
  sublabel?: string
  variant?: AppLoadingVariant
  className?: string
}

const SUBLABELS: Record<AppLoadingVariant, string> = {
  boot: "Preparing workspace",
  auth: "Opening your workspace",
  route: "Loading view",
}

export function AppLoadingScreen({ sublabel, variant = "boot", className }: AppLoadingScreenProps) {
  const statusText = sublabel ?? SUBLABELS[variant]

  return (
    <div
      role="status"
      aria-live="polite"
      data-cid="app-loading-screen"
      className={cn("bg-background text-foreground flex min-h-screen items-center justify-center px-6 py-10 motion-safe:animate-[loadingScreenIn_420ms_ease-out_both]", className)}
    >
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <div className="motion-safe:animate-[loadingMark_2.4s_ease-in-out_infinite]" aria-hidden="true">
          <Image src="/logo-wordmark.png" alt="" width={252} height={64} priority className="h-auto w-[13.5rem] sm:w-[15.75rem]" />
        </div>

        <div className="mt-8 w-full">
          <p className="text-foreground text-base font-semibold tracking-normal sm:text-lg">{statusText}</p>
        </div>

        <div className="bg-muted-foreground/25 mt-5 h-1.5 w-40 overflow-hidden rounded-full" aria-hidden="true">
          <div className="h-full w-1/2 rounded-full bg-[#FF5533] motion-safe:animate-[loadingLine_1.45s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
        </div>

        <span className="sr-only">{statusText}</span>
      </div>
    </div>
  )
}
