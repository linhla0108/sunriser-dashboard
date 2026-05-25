"use client"

import { useMemo, useState } from "react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type PieLabelRenderProps,
} from "recharts"
import type { Applicant } from "@/lib/types"
import { Button } from "@/components/ui/button"

// ─── Design constants ────────────────────────────────────────────────────────
const PRIMARY = "#FF5533"
const MUTED = "#6B5549"
const SECONDARY = "#ffdad3"
const CHART_GRID = "color-mix(in srgb, #6B5549 14%, transparent)"
const PIE_COLORS = [PRIMARY, SECONDARY, MUTED]
const tooltipStyle = { backgroundColor: "#ffffff", border: "1px solid #eeeeee", borderRadius: "12px", fontSize: "12px" }

// ─── Position abbreviations ───────────────────────────────────────────────────
const POSITION_ABBR: Record<string, string> = {
  "AI Engineering Intern": "AI",
  "Data Analysis Intern": "Data",
  "Game Design Intern": "GD",
  "Unity Development Intern": "Unity",
  "Game User Acquisition Intern": "UA",
  "Human Resources Intern": "HR",
  "Game Quality Assurance Intern": "QA",
}

// ─── Year of study parsing ────────────────────────────────────────────────────
function parseYear(raw: string): string {
  if (raw.includes("2")) return "Y2"
  if (raw.includes("3")) return "Y3"
  if (raw.includes("4")) return "Y4"
  if (raw.includes("1")) return "Y1"
  return raw
}

// ─── Chart data derivations ───────────────────────────────────────────────────
function byFunction(data: Applicant[]) {
  const map = new Map<string, number>()
  data.forEach(a => {
    const abbr = POSITION_ABBR[a.position1] ?? a.position1
    map.set(abbr, (map.get(abbr) ?? 0) + 1)
  })
  const total = data.length || 1
  return Array.from(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, pct: `${Math.round((count / total) * 100)}%` }))
}

function byUniversity(data: Applicant[]) {
  const map = new Map<string, number>()
  data.forEach(a => map.set(a.university, (map.get(a.university) ?? 0) + 1))
  return Array.from(map)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, pct: `${count}` }))
}

function byYear(data: Applicant[]) {
  const map = new Map<string, number>()
  data.forEach(a => {
    const y = parseYear(a.yearOfStudy)
    map.set(y, (map.get(y) ?? 0) + 1)
  })
  const order = ["Y1", "Y2", "Y3", "Y4"]
  return order.filter(y => map.has(y)).map(y => ({ name: y, count: map.get(y)!, pct: `${map.get(y)}` }))
}

function gpaDistribution(data: Applicant[]) {
  const bands = [
    { name: "<6.5", count: 0 },
    { name: "6.5–7", count: 0 },
    { name: "7–7.5", count: 0 },
    { name: "7.5–8", count: 0 },
    { name: "8–8.5", count: 0 },
    { name: "8.5–9", count: 0 },
    { name: "≥9", count: 0 },
  ]
  data.forEach(a => {
    if (a.gpa >= 9) bands[6].count++
    else if (a.gpa >= 8.5) bands[5].count++
    else if (a.gpa >= 8) bands[4].count++
    else if (a.gpa >= 7.5) bands[3].count++
    else if (a.gpa >= 7) bands[2].count++
    else if (a.gpa >= 6.5) bands[1].count++
    else bands[0].count++
  })
  return bands.map(b => ({ ...b, pct: `${b.count}` }))
}

function byExperience(data: Applicant[]) {
  let yes = 0
  let no = 0
  data.forEach(a => (a.hasExperience ? yes++ : no++))
  return [
    { name: "Yes", value: yes },
    { name: "No", value: no },
  ]
}

function byFullTime(data: Applicant[]) {
  let full = 0
  let part = 0
  data.forEach(a => (a.fullTime ? full++ : part++))
  return [
    { name: "Full-time", value: full },
    { name: "Part-time", value: part },
  ]
}

// ─── Chart card wrapper ───────────────────────────────────────────────────────
function ChartCard({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-v2-card=""
      className={`rounded-3xl bg-white p-4 shadow-[rgba(4,23,43,0.05)_0px_0px_0px_1px,rgba(0,0,0,0.1)_0px_20px_25px_-5px,rgba(0,0,0,0.1)_0px_8px_10px_-6px] ${isDragging ? "opacity-60" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold tracking-widest text-[#6B5549] uppercase">{title}</h3>
        <Button
          variant="plain"
          size="plain"
          {...attributes}
          {...listeners}
          type="button"
          aria-label={`Drag ${title}`}
          className="cursor-grab rounded-lg p-1 text-[#767676] hover:bg-[#f9f9f9]"
        >
          <GripVertical className="size-4" />
        </Button>
      </div>
      {children}
    </article>
  )
}

// ─── Pie label renderer ───────────────────────────────────────────────────────
function pieLabel({ percent }: PieLabelRenderProps) {
  const pct = typeof percent === "number" ? percent : 0
  return pct > 0.05 ? `${Math.round(pct * 100)}%` : ""
}

// ─── Chart IDs ────────────────────────────────────────────────────────────────
const CHART_IDS = ["kpi", "function", "university", "year", "gpa", "experience", "fulltime"] as const
type ChartId = (typeof CHART_IDS)[number]

const CHART_TITLES: Record<ChartId, string> = {
  kpi: "Total applicants",
  function: "By function",
  university: "By university",
  year: "By year of study",
  gpa: "GPA distribution",
  experience: "By experience",
  fulltime: "Full-time availability",
}

// ─── Main component ───────────────────────────────────────────────────────────
type FilterType = "all" | "passed" | "failed"

interface ChartViewProps {
  data: Applicant[]
}

export function ChartView({ data }: ChartViewProps) {
  const [filter, setFilter] = useState<FilterType>("all")
  const [order, setOrder] = useState<ChartId[]>([...CHART_IDS])

  const filtered = useMemo(() => {
    if (filter === "passed") return data.filter(a => a.round1Result === "Passed")
    if (filter === "failed") return data.filter(a => a.round1Result === "Failed" || a.round1Result === "Waiting list")
    return data
  }, [data, filter])

  const charts = useMemo(
    () => ({
      function: byFunction(filtered),
      university: byUniversity(filtered),
      year: byYear(filtered),
      gpa: gpaDistribution(filtered),
      experience: byExperience(filtered),
      fulltime: byFullTime(filtered),
    }),
    [filtered]
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setOrder(current => arrayMove(current, current.indexOf(active.id as ChartId), current.indexOf(over.id as ChartId)))
  }

  return (
    <section className="space-y-4">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        {(["all", "passed", "failed"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${filter === f ? "bg-[#FF5533] text-white" : "bg-black/5 text-[#6B5549] hover:text-[#1b1b1b]"}`}
          >
            {f === "all" ? "All" : f === "passed" ? "Passed" : "Failed"}
          </button>
        ))}
        <span className="ml-auto text-xs text-[#767676]">{filtered.length} applicants</span>
      </div>

      {/* Draggable chart grid */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {order.map(id => {
              const title = CHART_TITLES[id]

              if (id === "kpi") {
                return (
                  <ChartCard key={id} id={id} title={title}>
                    <div className="flex h-[180px] flex-col items-center justify-center gap-1">
                      <span className="font-[Proxima_Nova,sans-serif] text-[3.5rem] leading-none font-bold text-[#1b1b1b]">{filtered.length}</span>
                      <span className="text-xs text-[#767676]">applicants</span>
                    </div>
                  </ChartCard>
                )
              }

              if (id === "function") {
                return (
                  <ChartCard key={id} id={id} title={title}>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={charts.function} layout="vertical" margin={{ top: 4, right: 48, left: 8, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} width={44} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,85,51,0.06)" }} />
                        <Bar dataKey="count" fill={PRIMARY} radius={[0, 6, 6, 0]} maxBarSize={20}>
                          <LabelList dataKey="pct" position="right" style={{ fontSize: 10, fill: MUTED }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )
              }

              if (id === "university") {
                const uniHeight = Math.max(220, charts.university.length * 28)
                return (
                  <ChartCard key={id} id={id} title={title}>
                    <div style={{ overflowY: "auto", maxHeight: 300 }}>
                      <ResponsiveContainer width="100%" height={uniHeight}>
                        <BarChart data={charts.university} layout="vertical" margin={{ top: 4, right: 40, left: 8, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
                          <XAxis type="number" hide />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} width={120} />
                          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,85,51,0.06)" }} />
                          <Bar dataKey="count" fill={SECONDARY} radius={[0, 6, 6, 0]} maxBarSize={16}>
                            <LabelList dataKey="pct" position="right" style={{ fontSize: 10, fill: MUTED }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
                )
              }

              if (id === "year") {
                return (
                  <ChartCard key={id} id={id} title={title}>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={charts.year} margin={{ top: 16, right: 8, left: -24, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,85,51,0.06)" }} />
                        <Bar dataKey="count" fill={PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={40}>
                          <LabelList dataKey="pct" position="top" style={{ fontSize: 10, fill: MUTED }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )
              }

              if (id === "gpa") {
                return (
                  <ChartCard key={id} id={id} title={title}>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={charts.gpa} margin={{ top: 16, right: 8, left: -24, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,85,51,0.06)" }} />
                        <Bar dataKey="count" fill={PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={32}>
                          <LabelList dataKey="pct" position="top" style={{ fontSize: 10, fill: MUTED }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartCard>
                )
              }

              if (id === "experience") {
                return (
                  <ChartCard key={id} id={id} title={title}>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={charts.experience}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          label={pieLabel}
                          labelLine={false}
                        >
                          {charts.experience.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-1 flex justify-center gap-4">
                      {charts.experience.map((entry, i) => (
                        <div key={entry.name} className="flex items-center gap-1.5">
                          <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-xs text-[#6B5549]">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                )
              }

              if (id === "fulltime") {
                return (
                  <ChartCard key={id} id={id} title={title}>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={charts.fulltime}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          label={pieLabel}
                          labelLine={false}
                        >
                          {charts.fulltime.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-1 flex justify-center gap-4">
                      {charts.fulltime.map((entry, i) => (
                        <div key={entry.name} className="flex items-center gap-1.5">
                          <span className="inline-block size-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-xs text-[#6B5549]">{entry.name}</span>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                )
              }

              return null
            })}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  )
}
