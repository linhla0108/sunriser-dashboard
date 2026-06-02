import { UploadCloud } from "lucide-react"

export function AnnouncementAttachmentDropOverlay({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <div className="bg-background/70 pointer-events-none fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="border-primary bg-background flex max-w-sm flex-col items-center rounded-3xl border px-6 py-8 text-center shadow-2xl">
        <UploadCloud className="text-primary mb-3 size-7" />
        <div className="text-base font-semibold">Drop files to attach them</div>
        <div className="text-muted-foreground mt-1 text-sm">They will be added to this announcement queue, not the workspace upload sheet.</div>
      </div>
    </div>
  )
}
