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

const PIE_COLORS = ['#FF5533', '#ffdad3', '#6B5549']

const cardStyle = {
  boxShadow:
    'rgba(4, 23, 43, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.1) 0px 8px 10px -6px',
}

const tooltipStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #eeeeee',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  fontSize: '12px',
  color: '#1b1b1b',
}

function ChartCard({
  title,
  dataCid,
  children,
}: {
  title: string
  dataCid: string
  children: React.ReactNode
}) {
  return (
    <div data-cid={dataCid} className="rounded-3xl bg-white p-4" style={cardStyle}>
      <h3
        className="mb-3 font-semibold tracking-widest text-[#1b1b1b] uppercase"
        style={{ fontSize: 'var(--text-label, 11px)' }}
      >
        {title}
      </h3>
      {children}
    </div>
  )
}

export default function OverviewCharts() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Applications by Position */}
      <ChartCard title="Applications by Position" dataCid="chart-by-position">
        <ResponsiveContainer
          width="100%"
          height={220}
          className="h-[160px] sm:h-[200px] lg:h-[220px]"
        >
          <BarChart data={positionBreakdown} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f9f9f9" vertical={false} />
            <XAxis
              dataKey="short"
              tick={{ fontSize: 11, fill: '#6B5549' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: '#6B5549' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: '#f9f9f9' }}
              formatter={(v) => [`${v ?? ''}`, 'Applicants']}
            />
            <Bar dataKey="count" fill="#FF5533" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Round 1 Results */}
      <ChartCard title="Round 1 Results" dataCid="chart-round1">
        <ResponsiveContainer
          width="100%"
          height={220}
          className="h-[160px] sm:h-[200px] lg:h-[220px]"
        >
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
              formatter={(value) => <span style={{ fontSize: 12, color: '#555555' }}>{value}</span>}
            />
            <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v ?? ''}`, 'Applicants']} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Applications by Batch */}
      <ChartCard title="Applications by Batch" dataCid="chart-by-batch">
        <ResponsiveContainer
          width="100%"
          height={220}
          className="h-[160px] sm:h-[200px] lg:h-[220px]"
        >
          <BarChart data={batchData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f9f9f9" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#6B5549' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 11, fill: '#6B5549' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: '#f9f9f9' }}
              formatter={(v) => [`${v ?? ''}`, 'Applicants']}
            />
            <Bar dataKey="count" fill="#ffdad3" radius={[6, 6, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Discovery Channels */}
      <ChartCard title="Discovery Channels" dataCid="chart-discovery">
        <ResponsiveContainer
          width="100%"
          height={220}
          className="h-[160px] sm:h-[200px] lg:h-[220px]"
        >
          <BarChart
            data={discoveryChannelBreakdown}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f9f9f9" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: '#6B5549' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="channel"
              tick={{ fontSize: 11, fill: '#555555' }}
              axisLine={false}
              tickLine={false}
              width={64}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: '#f9f9f9' }}
              formatter={(v) => [`${v ?? ''}`, 'Applicants']}
            />
            <Bar dataKey="count" fill="#555555" radius={[0, 6, 6, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
