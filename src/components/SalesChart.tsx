'use client'

import { useState, useMemo } from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart,
} from 'recharts'
import { formatCurrency, formatDate, getDayOfWeek } from '@/lib/utils'
import { useDashboardData } from '@/context/DashboardData'

type ChartMode = 'daily' | 'yoy-weekly' | 'yoy-monthly'

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload
  return (
    <div className="card p-3 shadow-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
      <p className="text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-muted)' }}>
        {d.tooltipLabel || d.dateLabel || d.label}
      </p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-[12px]">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.stroke || entry.fill }} />
          <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
          <span className="font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function SalesChart() {
  const [mode, setMode] = useState<ChartMode>('daily')
  const { data: dashData } = useDashboardData()
  const dailySalesData = dashData.dailySales
  const monthly2025    = dashData.monthly2025

  // Daily data with 7-day moving average for trend line
  const dailyChart = useMemo(() => {
    const data = dailySalesData.map((d: any, i: number) => {
      // Calculate 7-day moving average
      const windowStart = Math.max(0, i - 6)
      const window = dailySalesData.slice(windowStart, i + 1)
      const avg7d = window.reduce((s: number, x: any) => s + x.totalSales, 0) / window.length

      return {
        ...d,
        dateLabel: formatDate(d.date),
        dayOfWeek: getDayOfWeek(d.date),
        tooltipLabel: `${getDayOfWeek(d.date)} ${formatDate(d.date)}`,
        trend: avg7d,
      }
    })
    return data
  }, [dailySalesData])

  const weeklyYoY = useMemo(() => {
    const weeks: any[] = []
    let curr: any = null
    let wk = 1
    dailySalesData.forEach((d: any, i: number) => {
      const dow = getDayOfWeek(d.date)
      if (dow === 'Mon' || i === 0) {
        if (curr) weeks.push(curr)
        curr = { label: `Wk ${wk}`, tooltipLabel: `Week ${wk} (${formatDate(d.date)})`, y2026: 0, y2025: 0 }
        wk++
      }
      if (curr) {
        curr.y2026 += d.totalSales
        curr.y2025 += d.prevYearTotalSales || 0
      }
    })
    if (curr) weeks.push(curr)
    return weeks
  }, [dailySalesData])

  const monthlyYoY = useMemo(() => {
    const months: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const y2026Monthly: Record<string, number> = {}
    dailySalesData.forEach((d: any) => {
      const m = new Date(d.date + 'T00:00:00').getMonth()
      const key = months[m]
      y2026Monthly[key] = (y2026Monthly[key] || 0) + d.totalSales
    })
    return months.map((m, i) => {
      const d25 = monthly2025[i] as any | undefined
      return {
        label: m,
        tooltipLabel: m,
        y2024: d25 ? (d25.prevYearTotalSales || 0) : 0,
        y2025: d25 ? d25.totalSales : 0,
        y2026: y2026Monthly[m] || 0,
      }
    })
  }, [dailySalesData, monthly2025])

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>Revenue</h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {mode === 'daily' ? 'Daily revenue with 7-day trend' : mode === 'yoy-weekly' ? '2026 vs 2025 (same period)' : '2024 vs 2025 vs 2026'}
          </p>
        </div>
        <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {([
            { key: 'daily', label: 'Daily' },
            { key: 'yoy-weekly', label: 'Weekly YoY' },
            { key: 'yoy-monthly', label: 'Monthly 3yr' },
          ] as { key: ChartMode; label: string }[]).map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className="px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all"
              style={{
                background: mode === m.key ? 'rgba(77, 159, 255, 0.12)' : 'transparent',
                color: mode === m.key ? 'var(--accent-blue)' : 'var(--text-muted)',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {mode === 'daily' ? (
            <ComposedChart data={dailyChart} barCategoryGap="15%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: '#6b6f80' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} interval={6} />
              <YAxis tick={{ fontSize: 10, fill: '#6b6f80' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="totalSales" name="Revenue" fill="var(--accent-blue)" radius={[3, 3, 0, 0]} fillOpacity={0.6} />
              <Line dataKey="trend" name="7-Day Trend" type="monotone" stroke="var(--accent-amber)" strokeWidth={2.5} dot={false} strokeLinecap="round" />
            </ComposedChart>
          ) : mode === 'yoy-weekly' ? (
            <BarChart data={weeklyYoY} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b6f80' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6b6f80' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="y2025" name="2025" fill="rgba(255,255,255,0.1)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="y2026" name="2026" fill="var(--accent-blue)" radius={[3, 3, 0, 0]} fillOpacity={0.8} />
            </BarChart>
          ) : (
            <BarChart data={monthlyYoY} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b6f80' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} />
              <YAxis tick={{ fontSize: 10, fill: '#6b6f80' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="y2024" name="2024" fill="rgba(255,255,255,0.06)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="y2025" name="2025" fill="rgba(160,125,252,0.45)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="y2026" name="2026" fill="var(--accent-blue)" radius={[3, 3, 0, 0]} fillOpacity={0.85} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
