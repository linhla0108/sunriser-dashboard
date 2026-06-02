"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { listAdminUsers } from "@/lib/admin/adminApi"
import { Button, buttonVariants } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth/useAuth"
import { mergeAnnouncementAttachments, splitAnnouncementAttachments } from "@/lib/announcements/attachments"
import { useAnnouncements } from "@/lib/announcements/AnnouncementProvider"
import { filterMentionCandidates, getMentionMatch, insertMention, type MentionCandidate, type MentionMatch } from "@/lib/announcements/mentions"
import { cn } from "@/lib/utils"
import {
  createAnnouncement,
  fetchAnnouncementStats,
  listManagedAnnouncements,
  softDeleteAnnouncement,
  updateAnnouncement,
  uploadAnnouncementAttachment,
} from "@/lib/announcements/client"
import type { AnnouncementPriority, AnnouncementSummary } from "@/lib/announcements/types"
import { AnnouncementAttachmentDropOverlay } from "./AnnouncementAttachmentDropOverlay"
import { AnnouncementComposer } from "./AnnouncementComposer"
import { ManagedAnnouncementList } from "./ManagedAnnouncementList"
import {
  emptyAnnouncementWindowState,
  formatQueuedAttachmentSize,
  toIsoDateTime,
  toLocalDateTimeParts,
  type AnnouncementWindowState,
} from "./announcementManagementUtils"

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
  const [windowState, setWindowState] = useState<AnnouncementWindowState>(emptyAnnouncementWindowState())
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
    setWindowState(emptyAnnouncementWindowState())
    setActiveMention(null)
    setActiveMentionIndex(0)
    setFiles([])
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      const startsAt = toIsoDateTime(windowState.startsAt.date, windowState.startsAt.time)
      const endsAt = toIsoDateTime(windowState.endsAt.date, windowState.endsAt.time)
      const saved = editingId
        ? await updateAnnouncement({ id: editingId, title, body, priority, pinned, startsAt, endsAt })
        : await createAnnouncement({ title, body, priority, pinned, startsAt, endsAt }, user.id)

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
  const queuedAttachmentSizeLabel = useMemo(() => formatQueuedAttachmentSize(files), [files])

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
        <AnnouncementComposer
          activeMention={activeMention}
          activeMentionIndex={activeMentionIndex}
          attachmentDragActive={attachmentDragActive}
          attachmentsOpen={attachmentsOpen}
          body={body}
          bodyRef={bodyRef}
          editingId={editingId}
          fileInputRef={fileInputRef}
          files={files}
          filteredMentionCandidates={filteredMentionCandidates}
          pinned={pinned}
          priority={priority}
          queuedAttachmentSizeLabel={queuedAttachmentSizeLabel}
          saving={saving}
          title={title}
          windowState={windowState}
          onCancelEdit={resetForm}
          onMentionSelect={handleMentionSelect}
          onQueueFiles={queueFiles}
          onSubmit={handleSubmit}
          setActiveMention={setActiveMention}
          setActiveMentionIndex={setActiveMentionIndex}
          setAttachmentsOpen={setAttachmentsOpen}
          setBody={setBody}
          setFiles={setFiles}
          setPinned={setPinned}
          setPriority={setPriority}
          setTitle={setTitle}
          setWindowState={setWindowState}
          syncMentionState={syncMentionState}
        />

        <ManagedAnnouncementList
          announcements={announcements}
          heading={heading}
          isAdmin={isAdmin}
          loading={loading}
          stats={stats}
          userId={user?.id}
          onEdit={startEdit}
          onDelete={setDeleteTarget}
        />
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

      <AnnouncementAttachmentDropOverlay active={attachmentDragActive} />
    </div>
  )
}
