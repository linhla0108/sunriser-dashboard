'use client'

import { useState } from 'react'
import Sidebar, { View } from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileBottomNav from '@/components/layout/MobileBottomNav'
import StatsCard from '@/components/dashboard/StatsCard'
import OverviewCharts from '@/components/dashboard/OverviewCharts'
import ApplicantTable from '@/components/table/ApplicantTable'
import GlobalDropZone from '@/components/upload/GlobalDropZone'
import FloatingChat from '@/components/chat/FloatingChat'
import ExportModal from '@/app/lab/components/ExportModal'
import ApplicantDrawer from '@/app/lab/components/ApplicantDrawer'
import { mockApplicants, dashboardStats } from '@/lib/mockData'
import type { Applicant } from '@/lib/types'

const PAGE_META: Record<View, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Overview',
    subtitle: 'SUN.RISER 2026 · Internship Recruitment',
  },
  table: {
    title: 'Applicants',
    subtitle: 'Browse, filter and reorder all candidates',
  },
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [exportOpen, setExportOpen] = useState(false)
  const [detailApplicant, setDetailApplicant] = useState<Applicant | null>(null)

  const handleViewChange = (view: View) => setActiveView(view)

  const topBarActions = (
    <>
      <button
        data-cid="btn-export-data"
        onClick={() => setExportOpen(true)}
        className="h-9 rounded-full border border-[#1b1b1b] px-4 text-sm font-semibold whitespace-nowrap text-[#1b1b1b] transition-colors hover:bg-[#f9f9f9]"
      >
        Export Data
      </button>
      <button
        data-cid="btn-create-report"
        onClick={() => setExportOpen(true)}
        className="h-9 rounded-full bg-[#FF5533] px-4 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-[#E63D1F]"
      >
        Create Report
      </button>
    </>
  )

  return (
    <GlobalDropZone onAnalyze={() => handleViewChange('table')}>
      <div className="flex h-screen">
        <Sidebar activeView={activeView} onViewChange={handleViewChange} />

        <main className="ml-0 min-h-screen flex-1 overflow-y-auto pb-16 sm:ml-16 sm:pb-0 lg:ml-[240px]">
          <div className="p-3 sm:p-4 lg:p-6">
            <TopBar
              title={PAGE_META[activeView].title}
              subtitle={PAGE_META[activeView].subtitle}
              actions={topBarActions}
            />

            {activeView === 'dashboard' && (
              <div>
                <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <StatsCard
                    title="Total Applicants"
                    value={dashboardStats.totalApplicants.toLocaleString()}
                    subtitle="Across 3 batches"
                    dataCid="stats-total"
                  />
                  <StatsCard
                    title="Passed Round 1"
                    value={dashboardStats.passedRound1}
                    subtitle="CV screening cleared"
                    accent
                    dataCid="stats-passed"
                  />
                  <StatsCard
                    title="Pass Rate"
                    value={`${dashboardStats.passRate}%`}
                    subtitle="Round 1 CV pass rate"
                    dataCid="stats-rate"
                  />
                  <StatsCard
                    title="Average GPA"
                    value={dashboardStats.avgGpa.toFixed(1)}
                    subtitle="Across all applicants"
                    dataCid="stats-gpa"
                  />
                </div>
                <OverviewCharts />
              </div>
            )}

            {activeView === 'table' && (
              <ApplicantTable data={mockApplicants} onViewDetail={setDetailApplicant} />
            )}
          </div>
        </main>
      </div>

      <MobileBottomNav activeView={activeView} onViewChange={handleViewChange} />
      <FloatingChat />
      <ApplicantDrawer
        applicant={detailApplicant}
        onClose={() => setDetailApplicant(null)}
        scorecard={undefined}
        onUpdateScorecard={() => {}}
        activities={[]}
        onAddActivity={() => {}}
        isInCompare={false}
        onToggleCompare={() => {}}
        onUpdateRound1={() => {}}
        onUpdateNotes={() => {}}
      />
      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        applicants={mockApplicants}
        totalAll={mockApplicants.length}
      />
    </GlobalDropZone>
  )
}
