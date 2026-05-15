'use client'

import { useState } from 'react'
import Sidebar, { View } from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import StatsCard from '@/components/dashboard/StatsCard'
import OverviewCharts from '@/components/dashboard/OverviewCharts'
import ApplicantTable from '@/components/table/ApplicantTable'
import UploadZone from '@/components/upload/UploadZone'
import ChatBox from '@/components/chat/ChatBox'
import { mockApplicants, dashboardStats } from '@/lib/mockData'

const PAGE_META: Record<View, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Overview',
    subtitle: 'SUN.RISER 2026 · Internship Recruitment',
  },
  table: {
    title: 'Applicants',
    subtitle: 'Browse, filter and reorder all candidates',
  },
  upload: {
    title: 'Upload Data',
    subtitle: 'Import spreadsheets and data files for analysis',
  },
  chat: {
    title: 'Chat',
    subtitle: 'Ask questions about your recruitment data',
  },
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>('dashboard')

  const handleViewChange = (view: View) => setActiveView(view)

  return (
    <div className="flex h-full">
      <Sidebar activeView={activeView} onViewChange={handleViewChange} />

      <main className="flex-1 ml-[240px] min-h-screen overflow-y-auto">
        <div className="p-8">
          <TopBar
            title={PAGE_META[activeView].title}
            subtitle={PAGE_META[activeView].subtitle}
          />

          {activeView === 'dashboard' && (
            <div>
              <div className="grid grid-cols-4 gap-5 mb-8">
                <StatsCard
                  title="Total Applicants"
                  value={dashboardStats.totalApplicants.toLocaleString()}
                  subtitle="Across 3 batches"
                />
                <StatsCard
                  title="Passed Round 1"
                  value={dashboardStats.passedRound1}
                  subtitle="CV screening cleared"
                  accent
                />
                <StatsCard
                  title="Pass Rate"
                  value={`${dashboardStats.passRate}%`}
                  subtitle="Round 1 CV pass rate"
                />
                <StatsCard
                  title="Average GPA"
                  value={dashboardStats.avgGpa.toFixed(1)}
                  subtitle="Across all applicants"
                />
              </div>
              <OverviewCharts />
            </div>
          )}

          {activeView === 'table' && (
            <ApplicantTable data={mockApplicants} />
          )}

          {activeView === 'upload' && (
            <UploadZone onAnalyze={() => handleViewChange('table')} />
          )}

          {activeView === 'chat' && (
            <ChatBox />
          )}
        </div>
      </main>
    </div>
  )
}
