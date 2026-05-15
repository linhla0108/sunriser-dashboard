'use client'

import { useState } from 'react'
import { Send, Database, Bot, User, Wifi } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Có bao nhiêu ứng viên pass Round 1?',
    timestamp: '14:02',
  },
  {
    id: '2',
    role: 'assistant',
    content:
      'Có **127 ứng viên** đã pass Round 1 CV screening, chiếm tỉ lệ **19.7%** tổng số hồ sơ (646 ứng viên).\n\nPhân tích theo vị trí:\n• AI Engineering Intern: **45** passed\n• Data Analysis Intern: **38** passed\n• Game Design Intern: **22** passed\n• Unity Development Intern: **18** passed\n• Game User Acquisition Intern: **4** passed\n• Human Resources Intern: **—** (chưa screening)\n\nNgoài ra còn 91 ứng viên trong danh sách Waiting List.',
    timestamp: '14:02',
  },
  {
    id: '3',
    role: 'user',
    content: 'Show me candidates with GPA > 8.5',
    timestamp: '14:05',
  },
  {
    id: '4',
    role: 'assistant',
    content:
      'Tìm thấy **89 ứng viên** có GPA > 8.5 trên tổng số 646 hồ sơ.\n\nPhân bổ theo trường:\n• **UIT** — 23 ứng viên\n• **HCMUT** — 18 ứng viên\n• **NEU** — 12 ứng viên\n• **FPT University** — 15 ứng viên\n• **RMIT Vietnam** — 9 ứng viên\n• Khác — 12 ứng viên\n\nGPA trung bình nhóm này: **8.91**. Trong số này, **74 ứng viên** (83%) đã pass Round 1.',
    timestamp: '14:05',
  },
]

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  const formattedContent = message.content
    .split('\n')
    .map((line, i) => {
      const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return (
        <p
          key={i}
          className={`${i > 0 ? 'mt-1.5' : ''} leading-relaxed`}
          dangerouslySetInnerHTML={{ __html: bold }}
        />
      )
    })

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
          isUser ? 'bg-[#17191c]' : 'bg-[#fbe1d1]'
        }`}
      >
        {isUser ? (
          <User size={14} className="text-white" />
        ) : (
          <Bot size={14} className="text-[#5d2a1a]" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm ${
            isUser
              ? 'bg-[#17191c] text-white rounded-tr-sm'
              : 'bg-white text-[#17191c] rounded-tl-sm border border-[#f0f0f0]'
          }`}
          style={
            !isUser
              ? {
                  boxShadow: '0 1px 4px rgba(4, 23, 43, 0.06)',
                }
              : undefined
          }
        >
          {formattedContent}
        </div>
        <span className="text-[10px] text-[#a3a6af] px-1">{message.timestamp}</span>
      </div>
    </div>
  )
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')

  const handleSend = () => {
    const text = input.trim()
    if (!text) return

    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }

    const aiMsg: Message = {
      id: String(Date.now() + 1),
      role: 'assistant',
      content:
        'Đây là demo UI — AI responses will be connected in production. Câu hỏi của bạn đã được ghi nhận: "' +
        text +
        '"',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg, aiMsg])
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-160px)]">
      {/* Left: Data Context panel */}
      <div
        className="w-64 flex-shrink-0 bg-white rounded-3xl p-5 flex flex-col gap-4 h-fit"
        style={{
          boxShadow:
            'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.06) 0px 4px 12px',
        }}
      >
        <div>
          <p className="text-xs font-semibold text-[#a3a6af] uppercase tracking-wider mb-3">
            Data Context
          </p>
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#f7f7f8]">
            <Database size={14} className="text-[#4c4c4c]" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#17191c] truncate">
                SUN.RISER 2026.xlsx
              </p>
              <p className="text-[10px] text-[#777b86] mt-0.5">646 records</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#a3a6af] uppercase tracking-wider mb-2">
            Sheets loaded
          </p>
          <div className="space-y-1.5">
            {[
              { name: 'SUN.RISER 2026', rows: 646 },
              { name: 'Batch 1', rows: 119 },
              { name: 'Batch 2', rows: 343 },
              { name: 'Batch 3', rows: 182 },
            ].map((sheet) => (
              <div
                key={sheet.name}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-xl hover:bg-[#f7f7f8] transition-colors"
              >
                <span className="text-xs text-[#4c4c4c] truncate">{sheet.name}</span>
                <span className="text-[10px] text-[#a3a6af] font-mono flex-shrink-0 ml-2">
                  {sheet.rows}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#a3a6af] uppercase tracking-wider mb-2">
            Suggested queries
          </p>
          <div className="space-y-1">
            {[
              'Top 10 GPA by position',
              'Failed by university',
              'Batch 2 pass rate',
              'Full-time availability',
            ].map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="w-full text-left text-xs text-[#4c4c4c] px-2.5 py-1.5 rounded-xl hover:bg-[#f7f7f8] transition-colors truncate"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Chat thread */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Connection badge */}
        <div
          className="bg-white rounded-2xl px-4 py-2.5 flex items-center gap-2 mb-4 self-start"
          style={{ boxShadow: 'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px' }}
        >
          <Wifi size={13} className="text-green-500" />
          <span className="text-xs font-medium text-[#4c4c4c]">
            Connected to:{' '}
            <span className="text-[#17191c] font-semibold">SUN.RISER 2026.xlsx</span>
          </span>
        </div>

        {/* Message thread */}
        <div
          className="flex-1 bg-white rounded-3xl p-6 overflow-y-auto space-y-5 mb-4"
          style={{
            boxShadow:
              'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.06) 0px 4px 12px',
          }}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>

        {/* Input bar */}
        <div
          className="bg-white rounded-3xl p-3 flex items-end gap-3"
          style={{
            boxShadow:
              'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px',
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your data... (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 resize-none text-sm text-[#17191c] placeholder:text-[#a3a6af] bg-transparent focus:outline-none py-2 px-3 max-h-32"
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-[#17191c] text-white flex items-center justify-center hover:bg-[#2d3035] transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
