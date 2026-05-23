import OverviewCharts from "@/components/dashboard/OverviewCharts"
import StatsCard from "@/components/dashboard/StatsCard"
import { dashboardStats } from "@/lib/mockData"

export default function DashboardPage() {
  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          title="Total Applicants"
          value={dashboardStats.totalApplicants.toLocaleString()}
          subtitle="Across 3 batches"
          dataCid="v2-stats-total"
        />
        <StatsCard title="Passed Round 1" value={dashboardStats.passedRound1} subtitle="CV screening cleared" accent dataCid="v2-stats-passed" />
        <StatsCard title="Pass Rate" value={`${dashboardStats.passRate}%`} subtitle="Round 1 CV pass rate" dataCid="v2-stats-rate" />
        <StatsCard title="Average GPA" value={dashboardStats.avgGpa.toFixed(1)} subtitle="Across all applicants" dataCid="v2-stats-gpa" />
      </div>
      <OverviewCharts />
    </div>
  )
}
