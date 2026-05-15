'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { positionBreakdown, discoveryChannelBreakdown } from '@/lib/mockData'

const batchData = [
  { name: 'Batch 1', count: 119 },
  { name: 'Batch 2', count: 343 },
  { name: 'Batch 3', count: 182 },
]

const round1Data = [
  { name: 'Passed', value: 127 },
  { name: 'Failed', value: 428 },
  { name: 'Waiting list', value: 91 },
]

const PIE_COLORS = ['#17191c', '#fbe1d1', '#777b86']

const cardStyle = {
  boxShadow:
    'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px',
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl p-6" style={cardStyle}>
      <h3 className="text-sm font-semibold text-[#17191c] mb-5 uppercase tracking-widest">
        {title}
      </h3>
      {children}
    </div>
  )
}

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid rgba(4, 23, 43, 0.08)',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  fontSize: '12px',
  color: '#17191c',
}

export default function OverviewCharts() {
  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Applications by Position */}
      <ChartCard title="Applications by Position">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={positionBreakdown}
            margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f7f7f8" vertical={false} />
            <XAxis
              dataKey="short"
              tick={{ fontSize: 11, fill: '#777b86' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#777b86' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: '#f7f7f8' }}
              formatter={(v) => [`${v ?? ''}`, 'Applicants']}
            />
            <Bar dataKey="count" fill="#17191c" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Round 1 Results Pie */}
      <ChartCard title="Round 1 Results">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={round1Data}
              cx="50%"
              cy="45%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {round1Data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i]} />
              ))}
            </Pie>
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ fontSize: 12, color: '#4c4c4c' }}>{value}</span>
              )}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => [`${v ?? ''}`, 'Applicants']}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Applications by Batch */}
      <ChartCard title="Applications by Batch">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={batchData}
            margin={{ top: 0, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f7f7f8" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#777b86' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#777b86' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: '#f7f7f8' }}
              formatter={(v) => [`${v ?? ''}`, 'Applicants']}
            />
            <Bar dataKey="count" fill="#fbe1d1" radius={[6, 6, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Discovery Channel */}
      <ChartCard title="Discovery Channels">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={discoveryChannelBreakdown}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f7f7f8" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#777b86' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="channel"
              tick={{ fontSize: 11, fill: '#4c4c4c' }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: '#f7f7f8' }}
              formatter={(v) => [`${v ?? ''}`, 'Applicants']}
            />
            <Bar dataKey="count" fill="#4c4c4c" radius={[0, 6, 6, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
