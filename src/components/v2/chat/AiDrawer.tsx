"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { DrawerShell } from "@/components/v2/common/DrawerShell"
import { useChat } from "@/lib/v2/chat/useChat"

export function AiDrawer() {
  const { messages, pending, send } = useChat()
  const [draft, setDraft] = useState("")

  return (
    <DrawerShell id="chat" title="AI Assistant" subtitle="Mock recruiting analyst">
      <div className="flex min-h-[420px] flex-col gap-3">
        <div className="min-h-0 flex-1 space-y-3 overflow-auto">
          {messages.map(message => (
            <div
              key={message.id}
              className={`rounded-2xl px-3 py-2 text-sm ${message.role === "assistant" ? "bg-[var(--v2-ink)]/5 text-[var(--v2-ink)]" : "ml-8 bg-[var(--v2-primary)] text-white"}`}
            >
              {message.content}
            </div>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={event => {
            event.preventDefault()
            const next = draft
            setDraft("")
            void send(next)
          }}
        >
          <input
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder="Ask about candidates..."
            className="h-10 min-w-0 flex-1 rounded-2xl border border-[var(--v2-ink)]/10 bg-[var(--v2-bg)] px-3 text-sm text-[var(--v2-ink)] outline-none focus:border-[var(--v2-primary)]"
          />
          <ActionTooltip label="Send message">
            <button
              type="submit"
              disabled={pending || !draft.trim()}
              className="flex size-10 items-center justify-center rounded-full bg-[var(--v2-primary)] text-white disabled:opacity-50"
            >
              <Send className="size-4" />
            </button>
          </ActionTooltip>
        </form>
      </div>
    </DrawerShell>
  )
}
