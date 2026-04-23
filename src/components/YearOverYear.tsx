'use client'

import { useMemo } from 'react'
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useDashboardData } from '@/context/DashboardData'

function StatBlock({ label, value, subtext, color }: { label: string; value: string; subtext?: string; color?: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="font-display font-bold text-[20px]" style={{ color: color || 'var(--text-primary)' }}>{value}</p>
      {subtext && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{subtext}</p>}
    </div>
  )
}

function GrowthBadge({ value, label }: { value: number; label: string }) {
  const positive = value >= 0
  return (
    <div className="flex items-center gap-1.5">
      {positive ? (
        <ArrowUpRight size={14} style={{ color: 'var(--accent-green)' }} />
      ) : (
        <ArrowDownRight size={14} style={{ color: 'var(--accent-red)' }} />
      )}
      <span className="text-[13px] font-bold font-mono" style={{ color: positive ? 'var(--accent-green)' : 'var(--accent-red)' }}>
        {positive ? '+' : ''}{value.toFixed(1)}%
      </span>
      <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  )
}

export default function YearOverYear() {
  const { data } = useDashboardData()
  const yoyData    = data.yearOverYear
  const dailySales = data.dailySales
  const monthly2025 = data.monthly2025
  const returns2024 = data.returns2024
  const returns2025 = data.returns2025

  const y24 = yoyData.years['2024']
  const y25 = yoyData.years['2025']
  const y26 = yoyData.years['2026']
  const comp = yoyData.periodComparison

  const firstDate = dailySales[0]?.date
  const lastDate  = dailySales[dailySales.length - 1]?.date
  const periodLabel = firstDate && lastDate
    ? `${formatDate(firstDate)} - ${formatDate(lastDate)}`
    : 'Current period'
  const periodDays = dailySales.length

  // Monthly revenue trend: 2025 full year
  const monthlyTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return monthly2025.map((m: any, i: number) => ({
      month: months[i],
      y2024: m.prevYearTotalSales || 0,
      y2025: m.totalSales,
    }))
  }, [monthly2025])

  // Monthly returns trend across 3 years
  const returnsTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return returns2025.map((r: any, i: number) => ({
      month: months[i],
      y2023: Math.abs((returns2024[i] as any)?.prevYearReturns || 0),
      y2024: Math.abs(r.prevYearReturns || 0),
      y2025: Math.abs(r.returns),
    }))
  }, [returns2024, returns2025])

  return (
    <div className="space-y-5">
      {/* Year cards side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 2024 */}
        <div className="card p-5" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[13px] font-bold font-display" style={{ color: 'var(--text-muted)' }}>2024</span>
            <GrowthBadge value={(y24 as any).yoyVs2023 ?? 0} label="vs 2023" />
          </div>
          <div className="space-y-4">
            <StatBlock label="Annual Revenue" value={formatCurrency(y24.totalSales, true)} />
            <StatBlock label="Total Orders" value={formatNumber(y24.totalOrders)} />
            <StatBlock label="Avg Order Value" value={formatCurrency(y24.aov)} />
            <StatBlock label="Returns" value={formatCurrency(Math.abs((y24 as any).returns))} subtext={`${(y24 as any).returnRate.toFixed(1)}% of sales`} />
            <StatBlock label="Monthly Average" value={formatCurrency((y24 as any).monthlyAvg)} />
          </div>
        </div>

        {/* 2025 */}
        <div className="card p-5" style={{ borderColor: 'rgba(160,125,252,0.12)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[13px] font-bold font-display" style={{ color: 'var(--accent-lavender)' }}>2025</span>
            <GrowthBadge value={y25.yoyVs2024} label="vs 2024" />
          </div>
          <div className="space-y-4">
            <StatBlock label="Annual Revenue" value={formatCurrency(y25.totalSales, true)} />
            <StatBlock label="Total Orders" value={formatNumber(y25.totalOrders)} />
            <StatBlock label="Avg Order Value" value={formatCurrency(y25.aov)} />
            <StatBlock label="Returns" value={formatCurrency(Math.abs(y25.returns))} subtext={`${y25.returnRate.toFixed(1)}% of sales`} />
            <StatBlock label="Monthly Average" value={formatCurrency(y25.monthlyAvg)} />
          </div>
        </div>

        {/* 2026 */}
        <div className="card p-5" style={{ borderColor: 'rgba(77,159,255,0.15)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[13px] font-bold font-display" style={{ color: 'var(--accent-blue)' }}>2026</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{ background: 'rgba(77,159,255,0.1)', color: 'var(--accent-blue)' }}>{periodDays} days</span>
          </div>
          <div className="space-y-4">
            <StatBlock label="Period Revenue" value={formatCurrency(y26.totalSales, true)} />
            <StatBlock label="Total Orders" value={formatNumber(y26.totalOrders)} />
            <StatBlock label="Avg Order Value" value={formatCurrency(y26.aov)} />
            <StatBlock label="Returns" value={formatCurrency(Math.abs(y26.returns))} subtext={`${y26.returnRate.toFixed(1)}% of sales`} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Annualized Pace</p>
              <p className="font-display font-bold text-[20px]" style={{ color: 'var(--accent-green)' }}>
                {formatCurrency(y26.annualizedSales, true)}
              </p>
              <GrowthBadge value={y26.yoyVs2025Full} label="vs 2025" />
            </div>
          </div>
        </div>
      </div>

      {/* Same-period comparison callout */}
      <div className="card p-5" style={{ borderColor: 'rgba(61,214,140,0.12)' }}>
        <h4 className="text-[13px] font-bold font-display mb-3" style={{ color: 'var(--text-primary)' }}>
          Apples to Apples: {periodLabel}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>2025 Sales</p>
            <p className="font-display font-bold text-[18px]" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(comp['2025'].totalSales, true)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>2026 Sales</p>
            <p className="font-display font-bold text-[18px]" style={{ color: 'var(--accent-blue)' }}>{formatCurrency(comp['2026'].totalSales, true)}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Revenue Growth</p>
            <p className="font-display font-bold text-[18px]" style={{ color: 'var(--accent-green)' }}>+{comp.salesGrowth.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Order Growth</p>
            <p className="font-display font-bold text-[18px]" style={{ color: 'var(--accent-green)' }}>+{comp.orderGrowth.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly revenue 2024 vs 2025 */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>Monthly Revenue</h3>
          <p className="text-[11px] mt-0.5 mb-4" style={{ color: 'var(--text-muted)' }}>2024 vs 2025 full year</p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b6f80' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b6f80' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="card p-3 shadow-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                        <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{payload[0]?.payload?.month}</p>
                        {payload.map((e: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-[11px]">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.fill }} />
                            <span style={{ color: 'var(--text-secondary)' }}>{e.name}:</span>
                            <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{formatCurrency(e.value)}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Bar dataKey="y2024" name="2024" fill="rgba(255,255,255,0.07)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="y2025" name="2025" fill="rgba(160,125,252,0.5)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly returns */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>Monthly Returns</h3>
          <p className="text-[11px] mt-0.5 mb-4" style={{ color: 'var(--text-muted)' }}>2023 / 2024 / 2025 return volume</p>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={returnsTrend}>
                <defs>
                  <linearGradient id="retG25" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f06060" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#f06060" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="retG24" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a07dfc" stopOpacity={0.10} />
                    <stop offset="100%" stopColor="#a07dfc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b6f80' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b6f80' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null
                    return (
                      <div className="card p-3 shadow-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                        <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{payload[0]?.payload?.month}</p>
                        {payload.map((e: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 text-[11px]">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: e.stroke || e.color }} />
                            <span style={{ color: 'var(--text-secondary)' }}>{e.name}:</span>
                            <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{formatCurrency(e.value)}</span>
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />
                <Area type="monotone" dataKey="y2023" name="2023 Returns" stroke="rgba(255,255,255,0.15)" strokeWidth={1.5} fill="rgba(255,255,255,0.02)" />
                <Area type="monotone" dataKey="y2024" name="2024 Returns" stroke="rgba(160,125,252,0.6)" strokeWidth={1.5} fill="url(#retG24)" />
                <Area type="monotone" dataKey="y2025" name="2025 Returns" stroke="#f06060" strokeWidth={2} fill="url(#retG25)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
