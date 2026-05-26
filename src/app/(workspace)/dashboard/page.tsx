"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import OverviewCharts from "@/components/dashboard/OverviewCharts"
import StatsCard from "@/components/dashboard/StatsCard"
import { ChartView } from "@/components/views/ChartView"
import { dashboardStats, mockApplicants } from "@/lib/mockData"

const SLIDES = ["Overview", "Charts"] as const

export default function DashboardPage() {
  const [slide, setSlide] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") setSlide(0)
      if (e.key === "ArrowRight") setSlide(1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const nav = (
    <nav
      aria-label="Dashboard slide navigation"
      className="border-border bg-card/70 ring-foreground/5 fixed inset-x-0 bottom-20 z-40 mx-auto flex w-fit items-center gap-1 rounded-full border p-1.5 shadow-[0_18px_44px_rgba(15,23,42,0.16)] ring-1 backdrop-blur-xl sm:bottom-6"
    >
      {SLIDES.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => setSlide(i)}
          aria-pressed={slide === i}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${slide === i ? "bg-primary text-white" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"}`}
        >
          {label}
        </button>
      ))}
    </nav>
  )

  return (
    <>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
          {/* Slide 0: Overview */}
          <div className="w-full shrink-0 p-3 sm:p-4 lg:p-6">
            <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatsCard
                title="Total Applicants"
                value={dashboardStats.totalApplicants.toLocaleString()}
                subtitle="Across 3 batches"
                dataCid="v2-stats-total"
              />
              <StatsCard
                title="Passed Round 1"
                value={dashboardStats.passedRound1}
                subtitle="CV screening cleared"
                accent
                dataCid="v2-stats-passed"
              />
              <StatsCard
                title="Pass Rate"
                value={`${dashboardStats.passRate}%`}
                subtitle="Round 1 CV pass rate"
                dataCid="v2-stats-rate"
              />
              <StatsCard
                title="Average GPA"
                value={dashboardStats.avgGpa.toFixed(1)}
                subtitle="Across all applicants"
                dataCid="v2-stats-gpa"
              />
            </div>
            <OverviewCharts />
          </div>

          {/* Slide 1: Charts */}
          <div className="w-full shrink-0 p-3 sm:p-4 lg:p-6">
            <ChartView data={mockApplicants} />
          </div>
        </div>
      </div>

      {mounted && createPortal(nav, document.body)}
    </>
  )
}
