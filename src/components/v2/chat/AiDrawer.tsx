"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { ActionTooltip } from "@/components/v2/common/ActionTooltip"
import { DrawerShell } from "@/components/v2/common/DrawerShell"
import { useChat } from "@/lib/v2/chat/useChat"
import { Button } from "@/components/ui/button"

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
              className={`rounded-2xl px-3 py-2 text-sm ${message.role === "assistant" ? "bg-foreground/5 text-foreground" : "bg-primary text-primary-foreground ml-8"}`}
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
            data-v2-field=""
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder="Ask about candidates..."
            className="border-foreground/10 bg-background/80 text-foreground focus:border-primary h-10 min-w-0 flex-1 rounded-2xl border px-3 text-sm outline-none"
          />
          <ActionTooltip label="Send message">
            <Button
              variant="plain"
              size="plain"
              type="submit"
              disabled={pending || !draft.trim()}
              className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="size-4" />
            </Button>
          </ActionTooltip>
        </form>
      </div>
    </DrawerShell>
  )
}
