"use client"

import { useMemo, useState } from "react"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import OverviewCharts from "@/components/dashboard/OverviewCharts"
import type { Applicant } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface ChartViewProps {
  data: Applicant[]
}

const MINI_CHART_FILL = "var(--v2-chart-1, #FF5533)"
const MINI_CHART_GRID = "color-mix(in srgb, var(--muted-foreground, #6B5549) 14%, transparent)"
const MINI_CHART_TICK = "var(--muted-foreground, #6B5549)"

const CHART_IDS = ["university", "month", "gpa"] as const

export function ChartView({ data }: ChartViewProps) {
  const [order, setOrder] = useState<Array<(typeof CHART_IDS)[number]>>([...CHART_IDS])
  const charts = useMemo(
    () => ({
      university: topUniversities(data),
      month: applicantsByMonth(data),
      gpa: gpaBands(data),
    }),
    [data]
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setOrder(current =>
      arrayMove(current, current.indexOf(active.id as (typeof CHART_IDS)[number]), current.indexOf(over.id as (typeof CHART_IDS)[number]))
    )
  }

  return (
    <section className="space-y-4">
      <OverviewCharts />
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {order.map(id => (
              <MiniChart key={id} id={id} title={miniChartTitle(id)} data={charts[id]} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  )
}

function MiniChart({ id, title, data }: { id: string; title: string; data: Array<{ name: string; count: number }> }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-v2-card=""
      className={`rounded-3xl bg-white p-4 shadow-[rgba(4,23,43,0.05)_0px_0px_0px_1px,rgba(0,0,0,0.1)_0px_20px_25px_-5px,rgba(0,0,0,0.1)_0px_8px_10px_-6px] ${isDragging ? "opacity-60" : ""}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 data-v2-muted="" className="text-xs font-semibold tracking-widest text-[#6B5549] uppercase">
          {title}
        </h3>
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
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={MINI_CHART_GRID} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: MINI_CHART_TICK }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: MINI_CHART_TICK }} axisLine={false} tickLine={false} />
          <Tooltip />
          <Bar dataKey="count" fill={MINI_CHART_FILL} radius={[6, 6, 0, 0]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </article>
  )
}

function miniChartTitle(id: string) {
  if (id === "university") return "Pass rate by university"
  if (id === "month") return "Applicants by month"
  return "GPA bands"
}

function topUniversities(data: Applicant[]) {
  return Array.from(
    data.reduce(
      (map, item) => map.set(item.university, (map.get(item.university) ?? 0) + (item.round1Result === "Passed" ? 1 : 0)),
      new Map<string, number>()
    )
  )
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }))
}

function applicantsByMonth(data: Applicant[]) {
  return Array.from(
    data.reduce((map, item) => {
      const month = new Date(item.submittedAt).toLocaleString("en", { month: "short" })
      return map.set(month, (map.get(month) ?? 0) + 1)
    }, new Map<string, number>())
  ).map(([name, count]) => ({ name, count }))
}

function gpaBands(data: Applicant[]) {
  const bands = [
    { name: "<7", count: 0 },
    { name: "7-8.4", count: 0 },
    { name: "8.5+", count: 0 },
  ]
  data.forEach(item => {
    if (item.gpa >= 8.5) bands[2].count += 1
    else if (item.gpa >= 7) bands[1].count += 1
    else bands[0].count += 1
  })
  return bands
}
