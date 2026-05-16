'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'

interface TopBarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export default function TopBar({ title, subtitle, actions }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <div data-cid="topbar" className="mb-4 flex items-center justify-between">
      <div>
        <h1
          className="font-bold tracking-tight text-[#1b1b1b]"
          style={{ fontSize: 'var(--text-h1, 22px)' }}
        >
          {title}
        </h1>
        {subtitle && <p className="mt-0.5 hidden text-sm text-[#6B5549] sm:block">{subtitle}</p>}
      </div>

      {/* Desktop/tablet actions */}
      {actions && <div className="hidden items-center gap-3 sm:flex">{actions}</div>}

      {/* Mobile: ⋮ overflow menu */}
      {actions && (
        <div ref={menuRef} className="relative sm:hidden">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#555555] transition-colors hover:bg-[#f9f9f9]"
            aria-label="More options"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div
              className="absolute top-full right-0 z-30 mt-1 min-w-[160px] rounded-2xl border border-[#f0f0f0] bg-white py-1.5 shadow-lg"
              style={{
                boxShadow:
                  'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.12) 0px 8px 24px',
              }}
            >
              <div className="flex flex-col">{actions}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
