"use client"

import type { Dispatch, FormEvent, RefObject, SetStateAction } from "react"
import { AtSign, ChevronDown, FileUp, Paperclip, UploadCloud, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DateTimeRangePicker } from "@/components/ui/date-time-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { formatAttachmentAcceptValue } from "@/lib/announcements/attachments"
import type { MentionCandidate, MentionMatch } from "@/lib/announcements/mentions"
import type { AnnouncementPriority } from "@/lib/announcements/types"
import { cn } from "@/lib/utils"
import { emptyAnnouncementWindowState, getInitials, PRIORITY_OPTIONS, PRIORITY_UI, type AnnouncementWindowState } from "./announcementManagementUtils"

interface AnnouncementComposerProps {
  activeMention: MentionMatch | null
  activeMentionIndex: number
  attachmentDragActive: boolean
  attachmentsOpen: boolean
  body: string
  bodyRef: RefObject<HTMLTextAreaElement | null>
  editingId: string | null
  fileInputRef: RefObject<HTMLInputElement | null>
  files: File[]
  filteredMentionCandidates: MentionCandidate[]
  pinned: boolean
  priority: AnnouncementPriority
  queuedAttachmentSizeLabel: string
  saving: boolean
  title: string
  windowState: AnnouncementWindowState
  onCancelEdit: () => void
  onMentionSelect: (candidate: MentionCandidate) => void
  onQueueFiles: (incoming: File[]) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  setActiveMention: Dispatch<SetStateAction<MentionMatch | null>>
  setActiveMentionIndex: Dispatch<SetStateAction<number>>
  setAttachmentsOpen: Dispatch<SetStateAction<boolean>>
  setBody: Dispatch<SetStateAction<string>>
  setFiles: Dispatch<SetStateAction<File[]>>
  setPinned: Dispatch<SetStateAction<boolean>>
  setPriority: Dispatch<SetStateAction<AnnouncementPriority>>
  setTitle: Dispatch<SetStateAction<string>>
  setWindowState: Dispatch<SetStateAction<AnnouncementWindowState>>
  syncMentionState: (nextValue: string, caret: number) => void
}

export function AnnouncementComposer({
  activeMention,
  activeMentionIndex,
  attachmentDragActive,
  attachmentsOpen,
  body,
  bodyRef,
  editingId,
  fileInputRef,
  files,
  filteredMentionCandidates,
  pinned,
  priority,
  queuedAttachmentSizeLabel,
  saving,
  title,
  windowState,
  onCancelEdit,
  onMentionSelect,
  onQueueFiles,
  onSubmit,
  setActiveMention,
  setActiveMentionIndex,
  setAttachmentsOpen,
  setBody,
  setFiles,
  setPinned,
  setPriority,
  setTitle,
  setWindowState,
  syncMentionState,
}: AnnouncementComposerProps) {
  return (
    <section className="border-foreground/10 rounded-2xl border p-4">
      <h2 className="text-base font-semibold">{editingId ? "Edit announcement" : "New announcement"}</h2>
      <form className="mt-4 space-y-4" onSubmit={onSubmit}>
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
            onSelect={event => syncMentionState(event.currentTarget.value, event.currentTarget.selectionStart ?? event.currentTarget.value.length)}
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
                if (candidate) onMentionSelect(candidate)
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
                        onMentionSelect(candidate)
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
              onClear={() => setWindowState(emptyAnnouncementWindowState())}
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
                  onQueueFiles(Array.from(event.target.files ?? []))
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
            <Button type="button" variant="outline" onClick={onCancelEdit} disabled={saving}>
              Cancel edit
            </Button>
          ) : null}
        </div>
      </form>
    </section>
  )
}
