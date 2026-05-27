"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Save, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TIMELINE_BATCHES, type TimelineEntry } from "@/lib/types"
import { cn } from "@/lib/utils"

const STAGGER_BASE = "motion-safe:animate-[drawerStaggerIn_360ms_cubic-bezier(0.16,1,0.3,1)_backwards]"

function toDateTimeLocal(iso: string | undefined): string {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function fromDateTimeLocal(value: string): string {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString()
}

interface ScheduleEntryDrawerProps {
  entry: TimelineEntry | null
  mode: "view" | "edit" | "create"
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (entry: TimelineEntry) => void
  onDelete?: (id: string) => void
}

export function ScheduleEntryDrawer({ entry, mode, open, onOpenChange, onSave, onDelete }: ScheduleEntryDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {entry ? (
        <DrawerBody
          key={entry.id}
          entry={entry}
          isCreate={mode === "create"}
          onOpenChange={onOpenChange}
          onSave={onSave}
          onDelete={onDelete}
        />
      ) : null}
    </Sheet>
  )
}

interface DrawerBodyProps {
  entry: TimelineEntry
  isCreate: boolean
  onOpenChange: (open: boolean) => void
  onSave: (entry: TimelineEntry) => void
  onDelete?: (id: string) => void
}

function DrawerBody({ entry, isCreate, onOpenChange, onSave, onDelete }: DrawerBodyProps) {
  const [draft, setDraft] = useState<TimelineEntry>(entry)
  const [saveState, setSaveState] = useState<"idle" | "saved">("idle")
  const [deleteArmed, setDeleteArmed] = useState(false)
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  function handleSave() {
    const cleaned: TimelineEntry = {
      ...draft,
      startDate: draft.startDate || new Date().toISOString(),
      endDate: draft.endDate || undefined,
      batch: draft.batch.trim(),
      todo: draft.todo.trim(),
      pic: draft.pic.trim(),
      note: draft.note.trim(),
    }
    onSave(cleaned)
    setSaveState("saved")
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      onOpenChange(false)
    }, 620)
  }

  function handleDelete() {
    if (!onDelete) return
    if (!deleteArmed) {
      setDeleteArmed(true)
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
      deleteTimerRef.current = setTimeout(() => setDeleteArmed(false), 3000)
      return
    }
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    onDelete(entry.id)
    onOpenChange(false)
  }

  const inputClass =
    "mt-2 rounded-2xl border-[#e2e2e2] focus-visible:border-[#FF5533] focus-visible:ring-2 focus-visible:ring-[#FF5533]/20"
  const textareaClass =
    "mt-2 w-full rounded-2xl border border-[#e2e2e2] bg-white p-3 text-sm transition-colors focus:border-[#FF5533] focus:ring-2 focus:ring-[#FF5533]/20 focus:outline-none"

  return (
    <SheetContent side="right" className="gap-0 data-[side=right]:w-full sm:data-[side=right]:max-w-md">
      <SheetHeader className={cn("border-b border-[#f0f0f0] p-5 pr-10", STAGGER_BASE)} style={{ animationDelay: "60ms" }}>
        <SheetTitle className="text-base leading-snug">{isCreate ? "New entry" : "Edit entry"}</SheetTitle>
        <SheetDescription>{isCreate ? "Add a new working timeline entry." : "Update entry details."}</SheetDescription>
      </SheetHeader>

      <div className={cn("flex-1 space-y-5 overflow-y-auto px-5 py-5", STAGGER_BASE)} style={{ animationDelay: "140ms" }}>
        <div>
          <Label htmlFor="todo" className="text-[11px] font-semibold tracking-wide text-[#555555] uppercase">
            Todo
          </Label>
          <Input
            id="todo"
            value={draft.todo}
            onChange={e => setDraft({ ...draft, todo: e.target.value })}
            placeholder="What needs to be done"
            className={inputClass}
            autoFocus={isCreate}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start" className="text-[11px] font-semibold tracking-wide text-[#555555] uppercase">
              Start
            </Label>
            <Input
              id="start"
              type="datetime-local"
              value={toDateTimeLocal(draft.startDate)}
              onChange={e => setDraft({ ...draft, startDate: fromDateTimeLocal(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <Label htmlFor="end" className="text-[11px] font-semibold tracking-wide text-[#555555] uppercase">
              End (optional)
            </Label>
            <Input
              id="end"
              type="datetime-local"
              value={toDateTimeLocal(draft.endDate)}
              onChange={e => setDraft({ ...draft, endDate: fromDateTimeLocal(e.target.value) || undefined })}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <Label className="text-[11px] font-semibold tracking-wide text-[#555555] uppercase">Batch</Label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {TIMELINE_BATCHES.map(b => {
              const normalized = b === "General" ? "" : b
              const active = (draft.batch.trim() === "" ? "General" : draft.batch) === b
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setDraft({ ...draft, batch: normalized })}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200",
                    active
                      ? "border-[#FF5533] bg-[#FF5533] text-white shadow-sm"
                      : "border-[#e2e2e2] bg-white text-[#555555] hover:border-[#FF5533] hover:bg-[#FFF1ED]"
                  )}
                >
                  {b}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <Label htmlFor="pic" className="text-[11px] font-semibold tracking-wide text-[#555555] uppercase">
            PIC <span className="text-[10px] font-normal text-[#999] normal-case">(format: - Name: roles)</span>
          </Label>
          <textarea
            id="pic"
            value={draft.pic}
            onChange={e => setDraft({ ...draft, pic: e.target.value })}
            rows={3}
            placeholder="- Linh: Game Design&#10;- Minh: HR"
            className={textareaClass}
          />
        </div>

        <div>
          <Label htmlFor="note" className="text-[11px] font-semibold tracking-wide text-[#555555] uppercase">
            Note{" "}
            <span className="text-[10px] font-normal text-[#999] normal-case">
              (include &ldquo;Cutoff time: DD/MM/YYYY - HH:mm&rdquo; to auto-extract)
            </span>
          </Label>
          <textarea
            id="note"
            value={draft.note}
            onChange={e => setDraft({ ...draft, note: e.target.value })}
            rows={4}
            placeholder="Note, dependencies, cutoff time…"
            className={textareaClass}
          />
        </div>
      </div>

      <SheetFooter className={cn("border-t border-[#f0f0f0] p-5", STAGGER_BASE)} style={{ animationDelay: "220ms" }}>
        <div className="flex w-full items-center justify-between gap-2">
          {!isCreate && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              aria-pressed={deleteArmed}
              className={cn(
                "gap-1.5 rounded-full transition-colors",
                deleteArmed
                  ? "bg-red-600 text-white hover:bg-red-700 hover:text-white"
                  : "text-red-600 hover:bg-red-50 hover:text-red-700"
              )}
            >
              <Trash2 className="size-4" />
              {deleteArmed ? "Confirm delete?" : "Delete"}
            </Button>
          ) : (
            <SheetClose render={<Button type="button" variant="ghost" className="gap-1.5 rounded-full" />}>
              <X className="size-4" /> Cancel
            </SheetClose>
          )}
          <Button
            type="button"
            onClick={handleSave}
            disabled={saveState === "saved"}
            className={cn(
              "gap-1.5 rounded-full transition-colors disabled:opacity-100",
              saveState === "saved"
                ? "bg-emerald-600 text-white hover:bg-emerald-600"
                : "bg-[#FF5533] text-white hover:bg-[#E63D1F]"
            )}
          >
            {saveState === "saved" ? (
              <>
                <Check className="size-4 motion-safe:animate-[drawerCrossfade_220ms_cubic-bezier(0.16,1,0.3,1)_backwards]" />
                Saved
              </>
            ) : (
              <>
                <Save className="size-4" /> Save
              </>
            )}
          </Button>
        </div>
      </SheetFooter>
    </SheetContent>
  )
}
