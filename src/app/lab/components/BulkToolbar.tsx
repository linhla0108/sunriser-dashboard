'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown } from 'lucide-react'
import { animate } from 'animejs'
import { prefersReducedMotion } from '../lab-utils'

const ROUND1_OPTIONS = ['Passed', 'Failed', 'Waiting list'] as const
const PIC_OPTIONS = ['Quỳnh', 'Nhiên', 'Yến', 'Minh', 'Huy', 'Linh']

interface BulkToolbarProps {
  selectedCount: number
  onClear: () => void
  onSetRound1: (result: 'Passed' | 'Failed' | 'Waiting list') => void
  onAssignPic: (pic: string) => void
  onExportSelected: () => void
}

export default function BulkToolbar({
  selectedCount,
  onClear,
  onSetRound1,
  onAssignPic,
  onExportSelected,
}: BulkToolbarProps) {
  const [round1Open, setRound1Open] = useState(false)
  const [picOpen, setPicOpen] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const prevCount = useRef(0)

  useEffect(() => {
    if (
      selectedCount > 0 &&
      prevCount.current === 0 &&
      toolbarRef.current &&
      !prefersReducedMotion()
    ) {
      animate(toolbarRef.current, {
        translateY: ['64px', '0px'],
        opacity: [0, 1],
        duration: 250,
        ease: 'outCubic',
      })
    }
    prevCount.current = selectedCount
  }, [selectedCount])

  if (selectedCount === 0) return null

  return (
    <div
      ref={toolbarRef}
      className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#1b1b1b] px-4 py-3 shadow-xl"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.24)' }}
    >
      <span className="text-sm font-semibold text-white tabular-nums">
        {selectedCount} selected
      </span>

      <div className="h-5 w-px bg-white/20" />

      {/* Set Round 1 */}
      <div className="relative">
        <button
          onClick={() => {
            setRound1Open((v) => !v)
            setPicOpen(false)
          }}
          className="flex h-7 items-center gap-1.5 rounded-full bg-white/10 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/20"
        >
          Set Round 1 <ChevronDown size={11} />
        </button>
        {round1Open && (
          <div
            className="absolute bottom-full left-0 mb-2 overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-xl"
            style={{ minWidth: 140 }}
          >
            {ROUND1_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onSetRound1(opt)
                  setRound1Open(false)
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#1b1b1b] transition-colors hover:bg-[#f9f9f9]"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Assign PIC */}
      <div className="relative">
        <button
          onClick={() => {
            setPicOpen((v) => !v)
            setRound1Open(false)
          }}
          className="flex h-7 items-center gap-1.5 rounded-full bg-white/10 px-3 text-xs font-semibold text-white transition-colors hover:bg-white/20"
        >
          Assign PIC <ChevronDown size={11} />
        </button>
        {picOpen && (
          <div
            className="absolute bottom-full left-0 mb-2 overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white shadow-xl"
            style={{ minWidth: 120 }}
          >
            {PIC_OPTIONS.map((pic) => (
              <button
                key={pic}
                onClick={() => {
                  onAssignPic(pic)
                  setPicOpen(false)
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-[#1b1b1b] transition-colors hover:bg-[#f9f9f9]"
              >
                {pic}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Export selected */}
      <button
        onClick={onExportSelected}
        className="h-7 rounded-full bg-[#8d1600] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#7a1200]"
      >
        Export
      </button>

      <div className="h-5 w-px bg-white/20" />

      {/* Clear */}
      <button
        onClick={onClear}
        className="flex h-7 w-7 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X size={13} />
      </button>
    </div>
  )
}
