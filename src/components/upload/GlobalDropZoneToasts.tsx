import { AlertCircle, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Toast } from "./globalDropZoneUtils"

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const bgMap = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  }
  const iconMap = {
    success: <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-green-600" />,
    error: <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-red-600" />,
    warning: <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-amber-600" />,
    info: <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-blue-600" />,
  }

  return (
    <div
      className={`flex max-w-[360px] items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm shadow-lg ${bgMap[toast.type]}`}
      style={{ animation: "slideInRight 200ms ease-out" }}
      role="alert"
      aria-live="polite"
    >
      {iconMap[toast.type]}
      <span className="flex-1 text-[13px] leading-relaxed">{toast.message}</span>
      <Button variant="plain" size="plain" onClick={() => onDismiss(toast.id)} className="mt-0.5 opacity-60 transition-opacity hover:opacity-100">
        <X size={13} />
      </Button>
    </div>
  )
}

export function GlobalDropZoneToasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="pointer-events-none fixed right-4 bottom-20 z-50 flex flex-col items-end gap-2 sm:right-6 sm:bottom-6">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  )
}
