"use client"

import { useState, useRef, useEffect } from "react"
import { Bot, X, Send, Database, ChevronDown, ChevronUp, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Có bao nhiêu ứng viên pass Round 1?",
    timestamp: "14:02",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "Có **127 ứng viên** đã pass Round 1 CV screening, chiếm tỉ lệ **19.7%** tổng số hồ sơ (646 ứng viên).\n\nPhân tích theo vị trí:\n• AI Engineering Intern: **45** passed\n• Data Analysis Intern: **38** passed\n• Game Design Intern: **22** passed\n• Unity Development Intern: **18** passed\n• Game User Acquisition Intern: **4** passed\n• Human Resources Intern: **—** (chưa screening)\n\nNgoài ra còn 91 ứng viên trong danh sách Waiting List.",
    timestamp: "14:02",
  },
]

const SUGGESTED_QUERIES = ["Top 10 GPA by position", "Failed by university", "Batch 2 pass rate", "Full-time availability"]

export function formatLine(line: string): React.ReactNode[] {
  return line.split(/\*\*(.*?)\*\*/g).map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  const formattedContent = message.content.split("\n").map((line, i) => (
    <p key={i} className={`${i > 0 ? "mt-1.5" : ""} leading-relaxed`}>
      {formatLine(line)}
    </p>
  ))

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${isUser ? "bg-[#FF5533]" : "bg-[#ffdad3]"}`}>
        {isUser ? <User size={12} className="text-white" /> : <Bot size={12} className="text-[#8d1600]" />}
      </div>
      <div className={`max-w-[78%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-3.5 py-2.5 text-[13px] ${
            isUser ? "rounded-tr-sm bg-[#FF5533] text-white" : "rounded-tl-sm border border-[#eeeeee] bg-white text-[#1b1b1b]"
          }`}
          style={!isUser ? { boxShadow: "0 1px 4px rgba(4, 23, 43, 0.06)" } : undefined}
        >
          {formattedContent}
        </div>
        <span className="px-1 text-[10px] text-[#767676]">{message.timestamp}</span>
      </div>
    </div>
  )
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState("")
  const [contextOpen, setContextOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) setIsOpen(false)
    }
    document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [isOpen])

  function handleSend() {
    const text = input.trim()
    if (!text) return

    const now = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    const userMsg: Message = { id: String(Date.now()), role: "user", content: text, timestamp: now }
    const aiMsg: Message = {
      id: String(Date.now() + 1),
      role: "assistant",
      content: `Đây là demo UI — AI responses will be connected in production. Câu hỏi: "${text}"`,
      timestamp: now,
    }

    setMessages(prev => [...prev, userMsg, aiMsg])
    setInput("")
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleSuggestedQuery(query: string) {
    setInput(query)
    inputRef.current?.focus()
  }

  return (
    <>
      {/* Floating trigger button */}
      <Button
        variant="plain"
        size="plain"
        data-cid="chat-trigger"
        onClick={() => setIsOpen(v => !v)}
        className="fixed right-6 bottom-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF5533] text-white shadow-lg transition-colors hover:bg-[#E63D1F] sm:bottom-6"
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)",
          boxShadow: "rgba(4, 23, 43, 0.15) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 8px 24px",
        }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={20} /> : <Bot size={20} />}
      </Button>

      {/* Chat panel — desktop/tablet: floating; mobile: full screen */}
      {isOpen && (
        <div
          data-cid="chat-panel"
          className="fixed inset-0 z-30 flex flex-col overflow-hidden bg-white sm:inset-auto sm:right-6 sm:bottom-24 sm:h-[560px] sm:w-[380px] sm:rounded-3xl"
          style={{
            boxShadow: "rgba(4, 23, 43, 0.08) 0px 0px 0px 1px, rgba(0, 0, 0, 0.18) 0px 24px 48px -12px",
            animation: "slideUpFade 150ms ease-out",
          }}
        >
          {/* Header */}
          <div data-cid="chat-panel-header" className="flex flex-shrink-0 items-center justify-between border-b border-[#f9f9f9] px-4 py-3.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ffdad3]">
                <Bot size={14} className="text-[#8d1600]" />
              </div>
              <div>
                <p className="text-[13px] font-bold tracking-tight text-[#1b1b1b]">SUN.RISER AI</p>
                <p className="text-[10px] text-[#767676]">● Connected: 2026.xlsx</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="plain"
                size="plain"
                onClick={() => setContextOpen(v => !v)}
                className="rounded-lg p-1.5 text-[#767676] transition-colors hover:bg-[#f9f9f9] hover:text-[#1b1b1b]"
                aria-label="Toggle data context"
                title="Data context"
              >
                <Database size={14} />
              </Button>
              <Button
                variant="plain"
                size="plain"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-[#767676] transition-colors hover:bg-[#f9f9f9] hover:text-[#1b1b1b]"
                aria-label="Close chat"
              >
                <X size={14} />
              </Button>
            </div>
          </div>

          {/* Message thread */}
          <div data-cid="chat-messages" className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Data context panel (collapsible) */}
          {contextOpen && (
            <div data-cid="chat-context-panel" className="flex-shrink-0 border-t border-[#f9f9f9] bg-[#fafafa] px-3 py-2.5">
              <Button variant="plain" size="plain" onClick={() => setContextOpen(false)} className="mb-2 flex w-full items-center gap-1.5 text-left">
                <ChevronUp size={12} className="text-[#767676]" />
                <span className="text-[10px] font-semibold tracking-widest text-[#767676] uppercase">Data Context</span>
              </Button>
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-[#f0f0f0] bg-white p-2">
                <Database size={12} className="text-[#555555]" />
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium text-[#1b1b1b]">SUN.RISER 2026.xlsx</p>
                  <p className="text-[10px] text-[#767676]">646 rows · Batch 1 · Batch 2 · Batch 3</p>
                </div>
              </div>
              <p className="mb-1.5 text-[10px] font-semibold tracking-widest text-[#767676] uppercase">Suggested</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUERIES.map(q => (
                  <Button
                    variant="plain"
                    size="plain"
                    key={q}
                    onClick={() => handleSuggestedQuery(q)}
                    className="rounded-full border border-[#e2e2e2] bg-white px-2.5 py-1 text-[11px] text-[#555555] transition-colors hover:border-[#FF5533] hover:text-[#FF5533]"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Context collapsed indicator */}
          {!contextOpen && (
            <Button
              variant="plain"
              size="plain"
              onClick={() => setContextOpen(true)}
              className="flex flex-shrink-0 items-center gap-1.5 border-t border-[#f9f9f9] px-4 py-2 transition-colors hover:bg-[#fafafa]"
            >
              <ChevronDown size={12} className="text-[#767676]" />
              <span className="text-[10px] font-semibold tracking-widest text-[#767676] uppercase">Data Context</span>
            </Button>
          )}

          {/* Input bar */}
          <div data-cid="chat-input-bar" className="flex-shrink-0 border-t border-[#f9f9f9] px-3 pt-2 pb-3">
            <div
              className="flex items-end gap-2 rounded-2xl bg-white px-3 py-2"
              style={{
                boxShadow: "rgba(4, 23, 43, 0.05) 0px 0px 0px 1px",
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your data..."
                rows={1}
                className="max-h-28 flex-1 resize-none bg-transparent py-1.5 text-[13px] text-[#1b1b1b] placeholder:text-[#767676] focus:outline-none"
                style={{ lineHeight: "1.5" }}
              />
              <Button
                variant="plain"
                size="plain"
                onClick={handleSend}
                disabled={!input.trim()}
                className="mb-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#FF5533] text-white transition-colors hover:bg-[#E63D1F] disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Send message"
              >
                <Send size={13} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
