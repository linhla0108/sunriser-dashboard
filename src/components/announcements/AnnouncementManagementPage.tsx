"use client"

import { format } from "date-fns"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { AtSign, CircleDot, ChevronDown, FileUp, Flag, Paperclip, Siren, Trash2, UploadCloud, X } from "lucide-react"
import { listAdminUsers } from "@/lib/admin/adminApi"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DateTimeRangePicker } from "@/components/ui/date-time-picker"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/lib/auth/useAuth"
import { formatAttachmentAcceptValue, mergeAnnouncementAttachments, splitAnnouncementAttachments } from "@/lib/announcements/attachments"
import { useAnnouncements } from "@/lib/announcements/AnnouncementProvider"
import { filterMentionCandidates, getMentionMatch, insertMention, type MentionCandidate, type MentionMatch } from "@/lib/announcements/mentions"
import { cn } from "@/lib/utils"
import {
  createAnnouncement,
  fetchAnnouncementStats,
  getAnnouncementAttachmentUrl,
  listManagedAnnouncements,
  softDeleteAnnouncement,
  updateAnnouncement,
  uploadAnnouncementAttachment,
} from "@/lib/announcements/client"
import type { AnnouncementPriority, AnnouncementSummary } from "@/lib/announcements/types"
import { AnnouncementPriorityBadge } from "./AnnouncementPriorityBadge"

const PRIORITY_OPTIONS: AnnouncementPriority[] = ["low", "normal", "high", "urgent"]
const PRIORITY_UI = {
  low: {
    label: "Low",
    description: "General context or updates",
    icon: CircleDot,
  },
  normal: {
    label: "Normal",
    description: "Standard team communication",
    icon: Flag,
  },
  high: {
    label: "High",
    description: "Action needed soon",
    icon: AtSign,
  },
  urgent: {
    label: "Urgent",
    description: "Immediate attention required",
    icon: Siren,
  },
} satisfies Record<AnnouncementPriority, { label: string; description: string; icon: typeof CircleDot }>

interface DateTimeParts {
  date: Date | undefined
  time: string
}

interface AnnouncementWindowState {
  startsAt: DateTimeParts
  endsAt: DateTimeParts
}

function toLocalDateTimeParts(iso: string | null): DateTimeParts {
  if (!iso) {
    return {
      date: undefined,
      time: "",
    }
  }

  const date = new Date(iso)

  return {
    date,
    time: format(date, "HH:mm"),
  }
}

function toIsoDateTime(date: Date | undefined, time: string) {
  if (!date || !time) return null

  const [hours, minutes] = time.split(":")
  if (hours === undefined || minutes === undefined) return null

  const nextDate = new Date(date)
  nextDate.setHours(Number(hours), Number(minutes), 0, 0)
  return nextDate.toISOString()
}

function formatWindowLabel(startsAt: string | null, endsAt: string | null) {
  if (startsAt && endsAt) return `Active ${new Date(startsAt).toLocaleString()} - ${new Date(endsAt).toLocaleString()}`
  if (startsAt) return `Starts ${new Date(startsAt).toLocaleString()}`
  if (endsAt) return `Ends ${new Date(endsAt).toLocaleString()}`
  return null
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function AnnouncementManagementPage() {
  const { user } = useAuth()
  const { refresh: refreshInbox } = useAnnouncements()
  const bodyRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dragCounterRef = useRef(0)
  const [announcements, setAnnouncements] = useState<AnnouncementSummary[]>([])
  const [mentionCandidates, setMentionCandidates] = useState<MentionCandidate[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [priority, setPriority] = useState<AnnouncementPriority>("normal")
  const [pinned, setPinned] = useState(false)
  const [windowState, setWindowState] = useState<AnnouncementWindowState>({
    startsAt: { date: undefined, time: "" },
    endsAt: { date: undefined, time: "" },
  })
  const [files, setFiles] = useState<File[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementSummary | null>(null)
  const [activeMention, setActiveMention] = useState<MentionMatch | null>(null)
  const [activeMentionIndex, setActiveMentionIndex] = useState(0)
  const [attachmentsOpen, setAttachmentsOpen] = useState(true)
  const [attachmentDragActive, setAttachmentDragActive] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isAdmin = user?.role === "admin"

  const loadPage = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [managed, readStats, staffResult] = await Promise.all([
        listManagedAnnouncements(user.role, user.id),
        fetchAnnouncementStats(),
        listAdminUsers().catch(() => null),
      ])
      setAnnouncements(managed)
      setStats(Object.fromEntries(readStats.map(stat => [stat.announcementId, stat.readCount])))
      setMentionCandidates(
        (staffResult ?? [])
          .filter(candidate => candidate.active)
          .map(candidate => ({
            id: candidate.user_id,
            name: candidate.full_name || candidate.email || "Unknown user",
            email: candidate.email,
            positions: candidate.positions ?? [],
          }))
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load announcements")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPage()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [loadPage])

  const resetForm = useCallback(() => {
    setEditingId(null)
    setTitle("")
    setBody("")
    setPriority("normal")
    setPinned(false)
    setWindowState({
      startsAt: { date: undefined, time: "" },
      endsAt: { date: undefined, time: "" },
    })
    setActiveMention(null)
    setActiveMentionIndex(0)
    setFiles([])
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      const saved = editingId
        ? await updateAnnouncement({
            id: editingId,
            title,
            body,
            priority,
            pinned,
            startsAt: toIsoDateTime(windowState.startsAt.date, windowState.startsAt.time),
            endsAt: toIsoDateTime(windowState.endsAt.date, windowState.endsAt.time),
          })
        : await createAnnouncement(
            {
              title,
              body,
              priority,
              pinned,
              startsAt: toIsoDateTime(windowState.startsAt.date, windowState.startsAt.time),
              endsAt: toIsoDateTime(windowState.endsAt.date, windowState.endsAt.time),
            },
            user.id
          )

      if (files.length > 0) {
        for (const file of files) {
          await uploadAnnouncementAttachment(saved.id, file)
        }
      }

      toast.success(editingId ? "Announcement updated" : "Announcement published")
      resetForm()
      await Promise.all([loadPage(), refreshInbox()])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save announcement")
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await softDeleteAnnouncement(deleteTarget.id)
      toast.success("Announcement deleted")
      setDeleteTarget(null)
      await Promise.all([loadPage(), refreshInbox()])
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete announcement")
    } finally {
      setSaving(false)
    }
  }

  function startEdit(announcement: AnnouncementSummary) {
    setEditingId(announcement.id)
    setTitle(announcement.title)
    setBody(announcement.body)
    setPriority(announcement.priority)
    setPinned(announcement.pinned)
    setWindowState({
      startsAt: toLocalDateTimeParts(announcement.startsAt),
      endsAt: toLocalDateTimeParts(announcement.endsAt),
    })
    setActiveMention(null)
    setActiveMentionIndex(0)
    setFiles([])
  }

  const heading = useMemo(() => (isAdmin ? "All announcements" : "Your announcements"), [isAdmin])
  const filteredMentionCandidates = useMemo(
    () => (activeMention ? filterMentionCandidates(mentionCandidates, activeMention.query).slice(0, 8) : []),
    [activeMention, mentionCandidates]
  )

  const queuedAttachmentSizeLabel = useMemo(() => {
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
    if (totalBytes < 1024) return `${totalBytes} B`
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`
  }, [files])

  function syncMentionState(nextValue: string, caret: number) {
    const nextMatch = getMentionMatch(nextValue, caret)
    setActiveMention(nextMatch)
    setActiveMentionIndex(0)
  }

  function handleMentionSelect(candidate: MentionCandidate) {
    if (!activeMention) return
    const { nextValue, nextCaret } = insertMention(body, activeMention, candidate.name)
    setBody(nextValue)
    setActiveMention(null)
    setActiveMentionIndex(0)
    requestAnimationFrame(() => {
      bodyRef.current?.focus()
      bodyRef.current?.setSelectionRange(nextCaret, nextCaret)
    })
  }

  const queueFiles = useCallback((incoming: File[]) => {
    const { accepted, rejected } = splitAnnouncementAttachments(incoming)

    if (rejected.length > 0) {
      toast.error(`Ignored ${rejected.length} unsupported file${rejected.length === 1 ? "" : "s"}. Use PDF, DOCX, XLSX, PNG, or JPG.`)
    }

    if (accepted.length === 0) return

    setFiles(current => mergeAnnouncementAttachments(current, accepted))
    setAttachmentsOpen(true)
    toast.success(`${accepted.length} attachment${accepted.length === 1 ? "" : "s"} added to the queue.`)
  }, [])

  useEffect(() => {
    const isFileDrag = (event: DragEvent) => event.dataTransfer?.types.includes("Files") === true

    const handleDragEnter = (event: DragEvent) => {
      if (!isFileDrag(event)) return
      event.preventDefault()
      dragCounterRef.current += 1
      setAttachmentDragActive(true)
    }

    const handleDragOver = (event: DragEvent) => {
      if (!isFileDrag(event)) return
      event.preventDefault()
    }

    const handleDragLeave = (event: DragEvent) => {
      if (!isFileDrag(event)) return
      event.preventDefault()
      dragCounterRef.current = Math.max(dragCounterRef.current - 1, 0)
      if (dragCounterRef.current === 0) setAttachmentDragActive(false)
    }

    const handleDrop = (event: DragEvent) => {
      if (!isFileDrag(event)) return
      event.preventDefault()
      dragCounterRef.current = 0
      setAttachmentDragActive(false)
      queueFiles(Array.from(event.dataTransfer?.files ?? []))
    }

    document.addEventListener("dragenter", handleDragEnter)
    document.addEventListener("dragover", handleDragOver)
    document.addEventListener("dragleave", handleDragLeave)
    document.addEventListener("drop", handleDrop)

    return () => {
      document.removeEventListener("dragenter", handleDragEnter)
      document.removeEventListener("dragover", handleDragOver)
      document.removeEventListener("dragleave", handleDragLeave)
      document.removeEventListener("drop", handleDrop)
    }
  }, [queueFiles])

  return (
    <div className="px-3 py-6 sm:px-4 lg:px-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Manage announcements</h1>
          <p className="text-muted-foreground mt-1 text-sm">Publish updates to all active users and track read counts.</p>
        </div>
        <Link href="/announcements" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to inbox
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="border-foreground/10 rounded-2xl border p-4">
          <h2 className="text-base font-semibold">{editingId ? "Edit announcement" : "New announcement"}</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <Label htmlFor="announcement-title">Title</Label>
              <Input
                id="announcement-title"
                value={title}
                onChange={event => setTitle(event.target.value)}
                maxLength={160}
                placeholder="Quarterly hiring update, office closure, policy reminder..."
              />
            </div>

            <div className="relative space-y-1.5">
              <Label htmlFor="announcement-body">Body</Label>
              <Textarea
                ref={bodyRef}
                id="announcement-body"
                value={body}
                onChange={event => {
                  const nextValue = event.target.value
                  setBody(nextValue)
                  syncMentionState(nextValue, event.target.selectionStart ?? nextValue.length)
                }}
                onSelect={event =>
                  syncMentionState(event.currentTarget.value, event.currentTarget.selectionStart ?? event.currentTarget.value.length)
                }
                onKeyDown={event => {
                  if (!activeMention || filteredMentionCandidates.length === 0) return

                  if (event.key === "ArrowDown") {
                    event.preventDefault()
                    setActiveMentionIndex(current => (current + 1) % filteredMentionCandidates.length)
                  }

                  if (event.key === "ArrowUp") {
                    event.preventDefault()
                    setActiveMentionIndex(current => (current - 1 + filteredMentionCandidates.length) % filteredMentionCandidates.length)
                  }

                  if (event.key === "Enter" || event.key === "Tab") {
                    event.preventDefault()
                    const candidate = filteredMentionCandidates[activeMentionIndex]
                    if (candidate) handleMentionSelect(candidate)
                  }

                  if (event.key === "Escape") {
                    event.preventDefault()
                    setActiveMention(null)
                  }
                }}
                maxLength={5000}
                rows={8}
                className="min-h-36"
                placeholder="Share the update, context, action items, and type @ to mention staff."
              />
              <p className="text-muted-foreground text-xs">Use @ to mention staff members from active accounts.</p>
              {activeMention && filteredMentionCandidates.length > 0 ? (
                <div className="border-border bg-background absolute right-0 bottom-0 left-0 z-20 translate-y-[calc(100%+0.5rem)] rounded-2xl border shadow-xl">
                  <div className="text-muted-foreground flex items-center gap-2 border-b px-3 py-2 text-xs">
                    <AtSign className="size-3.5" />
                    Mention staff
                  </div>
                  <ScrollArea className="max-h-64">
                    <div className="p-2">
                      {filteredMentionCandidates.map((candidate, index) => (
                        <Button
                          key={candidate.id}
                          type="button"
                          variant="plain"
                          size="plain"
                          className={cn(
                            "flex w-full items-center justify-start gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                            index === activeMentionIndex ? "bg-muted" : "hover:bg-muted/70"
                          )}
                          onMouseDown={event => {
                            event.preventDefault()
                            handleMentionSelect(candidate)
                          }}
                        >
                          <Avatar size="sm">
                            <AvatarFallback>{getInitials(candidate.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="text-sm font-medium">{candidate.name}</div>
                            <div className="text-muted-foreground truncate text-xs">
                              {[candidate.email, candidate.positions[0]].filter(Boolean).join(" • ")}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              ) : null}
            </div>

            <div className="grid gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="announcement-priority">Priority</Label>
                <div id="announcement-priority" className="grid gap-2 sm:grid-cols-2" aria-label="Announcement priority" role="radiogroup">
                  {PRIORITY_OPTIONS.map(option => {
                    const optionUi = PRIORITY_UI[option]
                    const Icon = optionUi.icon

                    return (
                      <Button
                        key={option}
                        type="button"
                        variant={priority === option ? "default" : "outline"}
                        size="plain"
                        role="radio"
                        aria-checked={priority === option}
                        className={cn(
                          "h-auto items-start justify-start rounded-2xl px-3 py-3 text-left",
                          priority === option ? "shadow-sm" : "text-foreground"
                        )}
                        onClick={() => setPriority(option)}
                      >
                        <div className="flex items-start gap-2">
                          <Icon className="mt-0.5 size-4" />
                          <div>
                            <div className="font-medium">{optionUi.label}</div>
                            <div className={cn("text-xs", priority === option ? "text-primary-foreground/80" : "text-muted-foreground")}>
                              {optionUi.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>

              <div className="flex w-full flex-col gap-2">
                <Label htmlFor="announcement-active-window">Active window</Label>
                <DateTimeRangePicker
                  id="announcement-active-window"
                  value={windowState}
                  onChange={setWindowState}
                  onClear={() =>
                    setWindowState({
                      startsAt: { date: undefined, time: "" },
                      endsAt: { date: undefined, time: "" },
                    })
                  }
                  placeholder="Set active window"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="announcement-pinned" checked={pinned} onCheckedChange={checked => setPinned(checked === true)} />
              <Label htmlFor="announcement-pinned" className="text-sm font-normal">
                Pin this announcement
              </Label>
            </div>

            <div className="space-y-2 rounded-2xl border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="announcement-files" className="flex items-center gap-2">
                    <Paperclip className="size-4" />
                    Attachments
                  </Label>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Drag files anywhere in this tab or browse to queue supporting documents for this announcement.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setAttachmentsOpen(open => !open)}>
                  {files.length > 0 ? `${files.length} queued` : "Optional"}
                  <ChevronDown className={cn("size-4 transition-transform", attachmentsOpen ? "rotate-180" : "")} />
                </Button>
              </div>

              {attachmentsOpen ? (
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="plain"
                    size="plain"
                    className={cn(
                      "border-border bg-muted/30 hover:bg-muted/50 flex w-full flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-6 text-center transition-colors",
                      attachmentDragActive && "border-primary bg-primary/5"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="mb-2 size-5" />
                    <div className="font-medium">Drop attachments here</div>
                    <div className="text-muted-foreground mt-1 text-xs">PDF, DOCX, XLSX, PNG, JPG. Maximum 10 MB per file.</div>
                  </Button>

                  <Input
                    ref={fileInputRef}
                    id="announcement-files"
                    type="file"
                    multiple
                    accept={formatAttachmentAcceptValue()}
                    className="hidden"
                    onChange={event => {
                      queueFiles(Array.from(event.target.files ?? []))
                      event.target.value = ""
                    }}
                  />

                  {files.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-muted-foreground flex items-center justify-between text-xs">
                        <span>
                          {files.length} file{files.length === 1 ? "" : "s"} ready to upload
                        </span>
                        <span>{queuedAttachmentSizeLabel}</span>
                      </div>
                      <div className="space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={`${file.name}:${file.size}:${file.lastModified}`}
                            className="bg-background flex items-center justify-between gap-3 rounded-xl border px-3 py-2"
                          >
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">{file.name}</div>
                              <div className="text-muted-foreground text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Remove ${file.name}`}
                              onClick={() => setFiles(current => current.filter((_, currentIndex) => currentIndex !== index))}
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground flex items-center gap-2 rounded-xl border border-dashed px-3 py-2 text-xs">
                      <FileUp className="size-4" />
                      Drag files into this tab and they will be queued here instead of opening the old upload sheet.
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Save changes" : "Publish announcement"}
              </Button>
              {editingId ? (
                <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="border-foreground/10 rounded-2xl border p-4">
          <div className="mb-4">
            <h2 className="text-base font-semibold">{heading}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {isAdmin ? "Admins can edit and delete all announcements." : "Managers can edit and delete only their own announcements."}
            </p>
          </div>

          {loading ? (
            <div className="space-y-3" aria-label="Loading managed announcements">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="border-foreground/10 rounded-2xl border p-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-3/4" />
                  <div className="mt-4 flex gap-2">
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {!loading && announcements.length === 0 ? <div className="text-muted-foreground text-sm">No managed announcements yet.</div> : null}

          <div className="space-y-3">
            {announcements.map(announcement => {
              const canEdit = isAdmin || announcement.authorUserId === user?.id
              return (
                <article key={announcement.id} className="border-foreground/10 rounded-2xl border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">{announcement.title}</h3>
                        {announcement.pinned ? <Badge variant="outline">Pinned</Badge> : null}
                        <AnnouncementPriorityBadge priority={announcement.priority} />
                      </div>
                      <p className="text-muted-foreground line-clamp-3 text-sm whitespace-pre-wrap">{announcement.body}</p>
                      <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
                        <span>Reads {stats[announcement.id] ?? 0}</span>
                        {formatWindowLabel(announcement.startsAt, announcement.endsAt) ? (
                          <span>{formatWindowLabel(announcement.startsAt, announcement.endsAt)}</span>
                        ) : null}
                        <span>
                          {announcement.attachments.length} attachment{announcement.attachments.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" size="sm" variant="outline" onClick={() => startEdit(announcement)} disabled={!canEdit}>
                        Edit
                      </Button>
                      <Button type="button" size="sm" variant="destructive" onClick={() => setDeleteTarget(announcement)} disabled={!canEdit}>
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {announcement.attachments.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {announcement.attachments.map(attachment => (
                        <Button
                          key={attachment.id}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const url = await getAnnouncementAttachmentUrl(attachment.id)
                              window.open(url, "_blank", "noopener,noreferrer")
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : "Failed to open attachment")
                            }
                          }}
                        >
                          {attachment.originalFilename}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>
      </div>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={open => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete announcement?</DialogTitle>
            <DialogDescription>This performs a soft delete. The announcement disappears from member and management views.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void confirmDelete()} disabled={saving}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {attachmentDragActive ? (
        <div className="bg-background/70 pointer-events-none fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="border-primary bg-background flex max-w-sm flex-col items-center rounded-3xl border px-6 py-8 text-center shadow-2xl">
            <UploadCloud className="text-primary mb-3 size-7" />
            <div className="text-base font-semibold">Drop files to attach them</div>
            <div className="text-muted-foreground mt-1 text-sm">They will be added to this announcement queue, not the workspace upload sheet.</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
