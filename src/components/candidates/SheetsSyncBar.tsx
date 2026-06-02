"use client"

import { useState, useEffect, useCallback } from "react"
import { Download, Upload, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth/useAuth"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface LastSync {
  direction: "pull" | "push"
  status: "ok" | "error"
  rowsCount: number | null
  finishedAt: string | null
}

function formatTime(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export function SheetsSyncBar() {
  const { can, isAdmin } = useAuth()
  const hasAccess = isAdmin || can("edit")

  const [pulling, setPulling] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [lastSync, setLastSync] = useState<LastSync | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/sheets/status")
      if (!res.ok) return
      const json = (await res.json()) as { ok: boolean; lastSync: LastSync | null }
      if (json.ok) setLastSync(json.lastSync)
    } catch {
      // Non-critical — status is best-effort
    }
  }, [])

  useEffect(() => {
    if (!hasAccess) return
    // fetchStatus is async and calls setLastSync only after the await resolves —
    // this is not a synchronous setState inside the effect body.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchStatus()
  }, [hasAccess, fetchStatus])

  async function handlePull() {
    if (pulling) return
    setPulling(true)
    try {
      const res = await fetch("/api/sheets/pull", { method: "POST" })
      const json = (await res.json()) as { ok: boolean; rowsCount?: number; error?: string }
      if (json.ok) {
        toast.success(`Pulled ${json.rowsCount ?? 0} candidates from Sheet.`)
        void fetchStatus()
      } else {
        toast.error("Pull failed. Contact your administrator.")
      }
    } catch {
      toast.error("Pull failed. Check your connection.")
    } finally {
      setPulling(false)
    }
  }

  async function handlePush() {
    if (pushing) return
    // Confirm before writing to sheet.
    toast.warning("Push all candidates to Google Sheet?", {
      action: {
        label: "Push",
        onClick: () => void executePush(),
      },
      duration: 8000,
    })
  }

  async function executePush() {
    setPushing(true)
    try {
      const res = await fetch("/api/sheets/push", { method: "POST" })
      const json = (await res.json()) as { ok: boolean; rowsCount?: number; error?: string }
      if (json.ok) {
        toast.success(`Pushed ${json.rowsCount ?? 0} candidates to Sheet.`)
        void fetchStatus()
      } else {
        toast.error("Push failed. Contact your administrator.")
      }
    } catch {
      toast.error("Push failed. Check your connection.")
    } finally {
      setPushing(false)
    }
  }

  if (!hasAccess) {
    return (
      <Tooltip>
        <TooltipTrigger>
          <div className="flex cursor-not-allowed items-center gap-1.5 opacity-40 select-none">
            <PillButton icon={<Download className="size-3.5" />} label="Pull" disabled />
            <PillButton icon={<Upload className="size-3.5" />} label="Push" disabled />
          </div>
        </TooltipTrigger>
        <TooltipContent>Admin or edit permission required</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <PillButton
        icon={pulling ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
        label="Pull"
        disabled={pulling || pushing}
        onClick={handlePull}
      />
      <PillButton
        icon={pushing ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
        label="Push"
        disabled={pulling || pushing}
        onClick={handlePush}
      />
      {lastSync ? (
        <span className="hidden text-[0.6875rem] text-[#767676] sm:inline">
          {lastSync.direction === "pull" ? "↓" : "↑"} {formatTime(lastSync.finishedAt)}
        </span>
      ) : null}
    </div>
  )
}

function PillButton({ icon, label, disabled, onClick }: { icon: React.ReactNode; label: string; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 rounded-full border border-[rgba(4,23,43,0.12)] bg-white px-2.5 py-1.5 text-[0.6875rem] font-medium text-[#1b1b1b] transition-colors hover:bg-[#f9f9f9] hover:text-[#FF5533] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {icon}
      {label}
    </button>
  )
}
