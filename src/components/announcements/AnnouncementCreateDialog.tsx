"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { listAdminUsers } from "@/lib/admin/adminApi"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth/useAuth"
import { mergeAnnouncementAttachments, splitAnnouncementAttachments } from "@/lib/announcements/attachments"
import { useAnnouncements } from "@/lib/announcements/AnnouncementProvider"
import { createAnnouncement, uploadAnnouncementAttachment } from "@/lib/announcements/client"
import { filterMentionCandidates, getMentionMatch, insertMention, type MentionCandidate, type MentionMatch } from "@/lib/announcements/mentions"
import type { AnnouncementPriority } from "@/lib/announcements/types"
import { AnnouncementAttachmentDropOverlay } from "./AnnouncementAttachmentDropOverlay"
import { AnnouncementComposer } from "./AnnouncementComposer"
import { emptyAnnouncementWindowState, formatQueuedAttachmentSize, toIsoDateTime, type AnnouncementWindowState } from "./announcementManagementUtils"

interface AnnouncementCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AnnouncementCreateDialog({ open, onOpenChange }: AnnouncementCreateDialogProps) {
  const { user } = useAuth()
  const { refresh: refreshInbox } = useAnnouncements()
  const bodyRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dragCounterRef = useRef(0)
  const [mentionCandidates, setMentionCandidates] = useState<MentionCandidate[]>([])
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [priority, setPriority] = useState<AnnouncementPriority>("normal")
  const [pinned, setPinned] = useState(false)
  const [windowState, setWindowState] = useState<AnnouncementWindowState>(emptyAnnouncementWindowState())
  const [files, setFiles] = useState<File[]>([])
  const [activeMention, setActiveMention] = useState<MentionMatch | null>(null)
  const [activeMentionIndex, setActiveMentionIndex] = useState(0)
  const [attachmentDragActive, setAttachmentDragActive] = useState(false)
  const [saving, setSaving] = useState(false)

  const resetForm = useCallback(() => {
    setTitle("")
    setBody("")
    setPriority("normal")
    setPinned(false)
    setWindowState(emptyAnnouncementWindowState())
    setFiles([])
    setActiveMention(null)
    setActiveMentionIndex(0)
    setAttachmentDragActive(false)
    dragCounterRef.current = 0
  }, [])

  useEffect(() => {
    if (!open) return

    let cancelled = false
    void listAdminUsers()
      .then(staffResult => {
        if (cancelled) return
        setMentionCandidates(
          staffResult
            .filter(candidate => candidate.active)
            .map(candidate => ({
              id: candidate.user_id,
              name: candidate.full_name || candidate.email || "Unknown user",
              email: candidate.email,
              positions: candidate.positions ?? [],
            }))
        )
      })
      .catch(() => {
        if (!cancelled) setMentionCandidates([])
      })

    return () => {
      cancelled = true
    }
  }, [open])

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
    toast.success(`${accepted.length} attachment${accepted.length === 1 ? "" : "s"} added to the queue.`)
  }, [])

  useEffect(() => {
    if (!open) return
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
  }, [open, queueFiles])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return

    setSaving(true)
    try {
      const saved = await createAnnouncement(
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

      for (const file of files) {
        await uploadAnnouncementAttachment(saved.id, file)
      }

      toast.success("Announcement published")
      resetForm()
      await refreshInbox()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save announcement")
    } finally {
      setSaving(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetForm()
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92dvh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-3xl">
        <DialogHeader className="border-b px-4 py-4 sm:px-5">
          <DialogTitle>New announcement</DialogTitle>
          <DialogDescription>Publish an update to active users without leaving the inbox.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[calc(92dvh-5.5rem)] overflow-y-auto px-4 py-4 sm:px-5">
          <AnnouncementComposer
            activeMention={activeMention}
            activeMentionIndex={activeMentionIndex}
            attachmentDragActive={attachmentDragActive}
            body={body}
            bodyRef={bodyRef}
            fileInputRef={fileInputRef}
            files={files}
            filteredMentionCandidates={filteredMentionCandidates}
            pinned={pinned}
            priority={priority}
            queuedAttachmentSizeLabel={queuedAttachmentSizeLabel}
            saving={saving}
            title={title}
            windowState={windowState}
            onMentionSelect={handleMentionSelect}
            onQueueFiles={queueFiles}
            onSubmit={handleSubmit}
            setActiveMention={setActiveMention}
            setActiveMentionIndex={setActiveMentionIndex}
            setBody={setBody}
            setFiles={setFiles}
            setPinned={setPinned}
            setPriority={setPriority}
            setTitle={setTitle}
            setWindowState={setWindowState}
            syncMentionState={syncMentionState}
          />
        </div>
        <AnnouncementAttachmentDropOverlay active={attachmentDragActive} />
      </DialogContent>
    </Dialog>
  )
}
