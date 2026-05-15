'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Eye, GripVertical } from 'lucide-react'
import { Applicant } from '@/lib/types'

interface DraggableRowProps {
  applicant: Applicant
  index: number
}

function Round1Badge({ result }: { result?: string }) {
  if (!result) return <span className="text-[#a3a6af] text-xs">—</span>

  const styles: Record<string, string> = {
    Passed:
      'bg-green-100 text-green-800 border border-green-200',
    Failed:
      'bg-red-50 text-red-700 border border-red-200',
    'Waiting list':
      'bg-amber-50 text-amber-700 border border-amber-200',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[result] ?? ''}`}
    >
      {result}
    </span>
  )
}

export default function DraggableRow({ applicant, index }: DraggableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: applicant.id })

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
      className={`border-b border-[#f7f7f8] hover:bg-[#f7f7f8]/70 transition-colors text-sm ${rowBg}`}
    >
      {/* Drag handle */}
      <td className="pl-4 pr-2 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-[#a3a6af] hover:text-[#777b86] touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical size={14} />
        </button>
      </td>

      <td className="px-3 py-3 text-[#a3a6af] text-xs font-mono w-8">{index + 1}</td>

      <td className="px-3 py-3">
        <div>
          <p className="font-medium text-[#17191c] whitespace-nowrap">{applicant.name}</p>
          <p className="text-xs text-[#a3a6af] mt-0.5">{applicant.email}</p>
        </div>
      </td>

      <td className="px-3 py-3">
        <span className="text-[#4c4c4c] text-xs whitespace-nowrap">
          {applicant.position1.replace(' Intern', '')}
        </span>
      </td>

      <td className="px-3 py-3">
        <span className="text-[#4c4c4c] text-xs">{applicant.university}</span>
      </td>

      <td className="px-3 py-3 text-center">
        <span
          className={`text-sm font-semibold ${
            applicant.gpa >= 8.5
              ? 'text-[#17191c]'
              : applicant.gpa >= 7.0
              ? 'text-[#4c4c4c]'
              : 'text-[#a3a6af]'
          }`}
        >
          {applicant.gpa.toFixed(1)}
        </span>
      </td>

      <td className="px-3 py-3 text-center">
        <span className="text-xs text-[#777b86]">{applicant.yearOfStudy.replace('Năm ', '')}</span>
      </td>

      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#f7f7f8] text-xs font-medium text-[#4c4c4c]">
          {applicant.batch}
        </span>
      </td>

      <td className="px-3 py-3">
        <span className="text-xs text-[#777b86]">{applicant.pic ?? '—'}</span>
      </td>

      <td className="px-3 py-3">
        <Round1Badge result={applicant.round1Result} />
      </td>

      <td className="px-3 py-3">
        {applicant.round2Result ? (
          <span className="text-xs text-[#4c4c4c]">{applicant.round2Result}</span>
        ) : (
          <span className="text-[#a3a6af] text-xs">—</span>
        )}
      </td>

      <td className="px-3 py-3 pr-4">
        <button
          className="p-1.5 rounded-lg hover:bg-[#f7f7f8] text-[#777b86] hover:text-[#17191c] transition-colors"
          aria-label="View applicant"
        >
          <Eye size={14} />
        </button>
      </td>
    </tr>
  )
}
