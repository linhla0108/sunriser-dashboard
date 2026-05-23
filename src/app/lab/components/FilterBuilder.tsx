"use client"

import { useState, useEffect, useRef } from "react"
import { X, Plus } from "lucide-react"
import { animate } from "animejs"
import { Dialog } from "@skeletonlabs/skeleton-react"
import { FilterCondition, FilterField, FilterOperator } from "../lab-types"
import { prefersReducedMotion } from "../lab-utils"
import { Button } from "@/components/ui/button"

const FIELDS: { value: FilterField; label: string; type: "text" | "number" | "select" }[] = [
  { value: "position1", label: "Position", type: "text" },
  { value: "batch", label: "Batch", type: "number" },
  { value: "gpa", label: "GPA", type: "number" },
  { value: "university", label: "University", type: "text" },
  { value: "round1Result", label: "Round 1", type: "text" },
  { value: "yearOfStudy", label: "Year of Study", type: "text" },
]

const OPERATORS_TEXT: { value: FilterOperator; label: string }[] = [
  { value: "contains", label: "contains" },
  { value: "equals", label: "equals" },
]

const OPERATORS_NUM: { value: FilterOperator; label: string }[] = [
  { value: "equals", label: "=" },
  { value: "gt", label: ">" },
  { value: "lt", label: "<" },
  { value: "gte", label: "≥" },
  { value: "lte", label: "≤" },
]

function newCondition(): FilterCondition {
  return {
    id: Math.random().toString(36).slice(2),
    field: "position1",
    operator: "contains",
    value: "",
  }
}

interface FilterBuilderProps {
  open: boolean
  conditions: FilterCondition[]
  onClose: () => void
  onApply: (conds: FilterCondition[]) => void
}

export default function FilterBuilder({ open, conditions, onClose, onApply }: FilterBuilderProps) {
  const [local, setLocal] = useState<FilterCondition[]>(() => (conditions.length ? [...conditions] : [newCondition()]))
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !panelRef.current || prefersReducedMotion()) return
    animate(panelRef.current, { translateX: ["100%", "0%"], duration: 280, ease: "outCubic" })
  }, [open])

  if (!open) return null

  function updateCond(id: string, patch: Partial<FilterCondition>) {
    setLocal(prev => prev.map(c => (c.id === id ? { ...c, ...patch } : c)))
  }

  function removeCond(id: string) {
    setLocal(prev => prev.filter(c => c.id !== id))
  }

  function apply() {
    onApply(local.filter(c => c.value.trim() !== ""))
    onClose()
  }

  return (
    <Dialog
      open={true}
      onOpenChange={isOpen => {
        if (!isOpen) onClose()
      }}
    >
      <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/20" onClick={onClose} />
      <Dialog.Positioner className="fixed inset-0 z-50 flex justify-end">
        <Dialog.Content
          ref={panelRef}
          aria-label="Filter builder"
          className="flex h-full w-full flex-col bg-white sm:w-[420px]"
          style={{ boxShadow: "-4px 0 40px rgba(4,23,43,0.12)" }}
        >
          <div className="flex flex-shrink-0 items-center justify-between border-b border-[#f5f5f5] px-5 py-4">
            <div>
              <h2 className="font-bold text-[#1b1b1b]" style={{ fontSize: "var(--text-h2)" }}>
                Filter Builder
              </h2>
              <p className="mt-0.5 text-xs text-[#767676]">Build custom filter conditions</p>
            </div>
            <Button
              variant="plain"
              size="plain"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#767676] transition-colors hover:bg-[#f9f9f9]"
            >
              <X size={14} />
            </Button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {local.map((cond, i) => {
              const fieldDef = FIELDS.find(f => f.value === cond.field)
              const isNum = fieldDef?.type === "number"
              const operators = isNum ? OPERATORS_NUM : OPERATORS_TEXT

              return (
                <div key={cond.id} className="flex items-start gap-2">
                  <span className="mt-2.5 w-6 flex-shrink-0 text-center text-xs text-[#767676]">{i === 0 ? "IF" : "AND"}</span>

                  {/* Field */}
                  <select
                    value={cond.field}
                    onChange={e =>
                      updateCond(cond.id, {
                        field: e.target.value as FilterField,
                        operator: e.target.value === "gpa" || e.target.value === "batch" ? "gte" : "contains",
                        value: "",
                      })
                    }
                    className="h-9 flex-1 rounded-2xl border border-[#e8e8e8] bg-[#f9f9f9] px-3 text-sm text-[#1b1b1b] transition-colors focus:border-[#8d1600] focus:outline-none"
                  >
                    {FIELDS.map(f => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>

                  {/* Operator */}
                  <select
                    value={cond.operator}
                    onChange={e => updateCond(cond.id, { operator: e.target.value as FilterOperator })}
                    className="h-9 w-20 rounded-2xl border border-[#e8e8e8] bg-[#f9f9f9] px-2 text-sm text-[#1b1b1b] transition-colors focus:border-[#8d1600] focus:outline-none"
                  >
                    {operators.map(o => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>

                  {/* Value */}
                  <input
                    type={isNum ? "number" : "text"}
                    value={cond.value}
                    onChange={e => updateCond(cond.id, { value: e.target.value })}
                    placeholder="Value..."
                    className="h-9 flex-1 rounded-2xl border border-[#e8e8e8] bg-white px-3 text-sm text-[#1b1b1b] placeholder-[#767676] transition-colors focus:border-[#8d1600] focus:outline-none"
                  />

                  <Button
                    variant="plain"
                    size="plain"
                    onClick={() => removeCond(cond.id)}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl text-[#767676] transition-colors hover:bg-[#fef2f2] hover:text-[#ef4444]"
                  >
                    <X size={13} />
                  </Button>
                </div>
              )
            })}

            <Button
              variant="plain"
              size="plain"
              onClick={() => setLocal(prev => [...prev, newCondition()])}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-full border border-dashed border-[#e5e5e5] px-4 text-sm font-medium text-[#767676] transition-colors hover:border-[#8d1600] hover:text-[#8d1600]"
            >
              <Plus size={14} /> Add condition
            </Button>
          </div>

          <div className="flex flex-shrink-0 gap-3 border-t border-[#f5f5f5] px-5 py-4">
            <Button
              variant="plain"
              size="plain"
              onClick={() => {
                setLocal([])
                onApply([])
                onClose()
              }}
              className="h-9 flex-1 rounded-full border border-[#e5e5e5] text-sm font-semibold text-[#555555] transition-colors hover:bg-[#f9f9f9]"
            >
              Clear all
            </Button>
            <Button
              variant="plain"
              size="plain"
              onClick={apply}
              className="h-9 flex-1 rounded-full bg-[#8d1600] text-sm font-semibold text-white transition-colors hover:bg-[#7a1200]"
            >
              Apply filters
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog>
  )
}
