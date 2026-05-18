"use client"

import { nanoid } from "nanoid"
import { z } from "zod"
import { useState } from "react"
import { usePersistedState } from "@/lib/v2/persistence/usePersistedState"
import { matchResponse } from "./mockResponses"
import type { Message } from "./types"

const messageSchema = z.array(
  z.object({
    id: z.string(),
    role: z.enum(["user", "assistant"]),
    content: z.string(),
    timestamp: z.string(),
  })
)

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Ask me about shortlist quality, candidate risk, or report ideas.",
    timestamp: "2026-05-18T00:00:00.000Z",
  },
]

export function useChat() {
  const [messages, setMessages] = usePersistedState<Message[]>("v2.chat.history", INITIAL_MESSAGES, messageSchema)
  const [pending, setPending] = useState(false)

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || pending) return

    const now = new Date().toISOString()
    const userMessage: Message = { id: nanoid(8), role: "user", content: trimmed, timestamp: now }
    const assistantMessage: Message = { id: nanoid(8), role: "assistant", content: matchResponse(trimmed), timestamp: now }

    setPending(true)
    setMessages(current => [...current, userMessage, assistantMessage])
    await new Promise(resolve => setTimeout(resolve, 160))
    setPending(false)
  }

  return { messages, pending, send }
}
