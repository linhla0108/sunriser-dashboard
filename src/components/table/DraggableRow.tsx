'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Eye, GripVertical } from 'lucide-react'
import type { ReactNode } from 'react'
import { Applicant } from '@/lib/types'

interface DraggableRowProps {
  applicant: Applicant
  index: number
  onViewDetail?: (applicant: Applicant) => void
  pinAction?: ReactNode
}

function Round1Badge({ result }: { result?: string }) {
  if (!result) return <span className="text-xs text-[#767676]">—</span>

  const styles: Record<string, string> = {
    Passed: 'bg-green-100 text-green-800 border border-green-200',
    Failed: 'bg-red-50 text-red-700 border border-red-200',
    'Waiting list': 'bg-amber-50 text-amber-700 border border-amber-200',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[result] ?? ''}`}
    >
      {result}
    </span>
  )
}

export default function DraggableRow({ applicant, index, onViewDetail, pinAction }: DraggableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: applicant.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const rowBg =
    applicant.round1Result === 'Passed'
      ? 'bg-green-50/60'
      : applicant.round1Result === 'Waiting list'
        ? 'bg-amber-50/60'
        : ''

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-[#f9f9f9] text-sm transition-colors hover:bg-[#f9f9f9]/70 ${rowBg}`}
    >
      {pinAction ? <td className="py-3 pr-1 pl-4">{pinAction}</td> : null}

      {/* Drag handle */}
      <td className={`py-3 pr-2 ${pinAction ? 'pl-1' : 'pl-4'}`}>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-[#767676] hover:text-[#6B5549] active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical size={14} />
        </button>
      </td>

      <td className="w-8 px-3 py-3 font-mono text-xs text-[#767676]">{index + 1}</td>

      {/* Name — always visible */}
      <td className="px-3 py-3">
        <div>
          <p className="max-w-[140px] truncate font-medium text-[#1b1b1b] sm:max-w-none">
            {applicant.name}
          </p>
          <p className="mt-0.5 hidden text-xs text-[#767676] sm:block">{applicant.email}</p>
        </div>
      </td>

      {/* Position — always visible */}
      <td className="px-3 py-3">
        <span className="text-xs whitespace-nowrap text-[#555555]">
          {applicant.position1.replace(' Intern', '')}
        </span>
      </td>

      {/* University — desktop only */}
      <td className="hidden px-3 py-3 lg:table-cell">
        <span className="text-xs text-[#555555]">{applicant.university}</span>
      </td>

      {/* GPA — tablet+ */}
      <td className="hidden px-3 py-3 text-center sm:table-cell">
        <span
          className={`text-sm font-semibold ${
            applicant.gpa >= 8.5
              ? 'text-[#1b1b1b]'
              : applicant.gpa >= 7.0
                ? 'text-[#555555]'
                : 'text-[#767676]'
          }`}
        >
          {applicant.gpa.toFixed(1)}
        </span>
      </td>

      {/* Year — desktop only */}
      <td className="hidden px-3 py-3 text-center lg:table-cell">
        <span className="text-xs text-[#6B5549]">{applicant.yearOfStudy.replace('Năm ', '')}</span>
      </td>

      {/* Batch — tablet+ */}
      <td className="hidden px-3 py-3 text-center sm:table-cell">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#f9f9f9] text-xs font-medium text-[#555555]">
          {applicant.batch}
        </span>
      </td>

      {/* PIC — desktop only */}
      <td className="hidden px-3 py-3 lg:table-cell">
        <span className="text-xs text-[#6B5549]">{applicant.pic ?? '—'}</span>
      </td>

      {/* Round 1 — always visible */}
      <td className="px-3 py-3">
        <Round1Badge result={applicant.round1Result} />
      </td>

      {/* Round 2 — tablet+ */}
      <td className="hidden px-3 py-3 sm:table-cell">
        {applicant.round2Result ? (
          <span className="text-xs text-[#555555]">{applicant.round2Result}</span>
        ) : (
          <span className="text-xs text-[#767676]">—</span>
        )}
      </td>

      <td className="px-3 py-3 pr-4">
        <button
          onClick={() => onViewDetail?.(applicant)}
          className="rounded-lg p-1.5 text-[#6B5549] transition-colors hover:bg-[#f9f9f9] hover:text-[#FF5533]"
          aria-label="View applicant"
        >
          <Eye size={14} />
        </button>
      </td>
    </tr>
  )
}
