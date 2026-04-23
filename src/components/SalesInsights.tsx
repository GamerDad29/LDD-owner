'use client'

import { useMemo, useState } from 'react'
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { formatCurrency, formatNumber, formatDate, getDayOfWeek } from '@/lib/utils'
import {
  TrendingUp, ShoppingBag, Calendar, Package,
  Sparkles, Loader2, AlertTriangle, ChevronDown, ChevronUp,
} from 'lucide-react'
import productSalesData from '@/data/productSales.json'
import { useDashboardData } from '@/context/DashboardData'

// ─── Duck Norris AI hook ─────────────────────────────────────────────────────
function useInsight(section: string, data: any) {
  const [text, setText]       = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string>('')
  const [open, setOpen]       = useState(false)

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, data }),
      })
      const json = await res.json()
      if (json.error) { setError(json.error); return }
      setText(json.insight)
      setOpen(true)
    } catch (e: any) {
      setError(e.message ?? 'Failed to connect')
    } finally {
      setLoading(false)
    }
  }

  return { text, loading, error, open, setOpen, generate }
}

// ─── Duck Norris button + panel ──────────────────────────────────────────────
function DuckInsight({
  section, data,
  label = 'Ask Duck Norris',
  buttonLabel,
}: {
  section: string
  data: any
  label?: string
  buttonLabel?: string
}) {
  const { text, loading, error, open, setOpen, generate } = useInsight(section, data)
  const displayLabel = buttonLabel ?? label

  return (
    <div className="mt-3">
      <button
        onClick={text ? () => setOpen(!open) : generate}
        disabled={loading}
        title={buttonLabel ? label : undefined}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
        style={{
          background: 'oklch(0.78 0.13 198 / 0.07)',
          border: '1px solid oklch(0.78 0.13 198 / 0.18)',
          color: 'var(--accent-primary)',
          opacity: loading ? 0.7 : 1,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'oklch(0.78 0.13 198 / 0.14)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'oklch(0.78 0.13 198 / 0.07)' }}
      >
        {loading
          ? <><Loader2 size={12} className="animate-spin" /> Thinking...</>
          : text
            ? open
              ? <><ChevronUp size={12} /> Hide</>
              : <><ChevronDown size={12} /> Show insight</>
            : <><Sparkles size={12} /> {displayLabel}</>
        }
      </button>

      {error && (
        <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg text-[11px]" style={{ background: 'oklch(0.63 0.17 18 / 0.06)', border: '1px solid oklch(0.63 0.17 18 / 0.13)', color: 'var(--accent-red)' }}>
          <AlertTriangle size={12} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {text && open && (
        <div
          className="mt-2 px-3.5 py-3 rounded-xl text-[12px] leading-relaxed"
          style={{
            background: 'linear-gradient(135deg, oklch(0.78 0.13 198 / 0.06) 0%, oklch(0.78 0.13 198 / 0.02) 100%)',
            border: '1px solid oklch(0.78 0.13 198 / 0.16)',
            color: 'var(--text-secondary)',
          }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'oklch(0.78 0.13 198 / 0.13)' }}>
              <Sparkles size={9} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent-primary)' }}>Duck Norris</span>
          </div>
          {text}
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SalesInsights() {
  const { data } = useDashboardData()
  const dailySalesData = data.dailySales
  const yoyData        = data.yearOverYear

  const dayOfWeekStats = useMemo(() => {
    const days: Record<string, { sales: number; orders: number; count: number }> = {}
    const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    dailySalesData.forEach((d: any) => {
      const dow = getDayOfWeek(d.date)
      if (!days[dow]) days[dow] = { sales: 0, orders: 0, count: 0 }
      days[dow].sales  += d.totalSales
      days[dow].orders += d.orders
      days[dow].count++
    })
    return order.map(day => ({
      day,
      avgSales:  days[day] ? days[day].sales  / days[day].count : 0,
      avgOrders: days[day] ? Math.round(days[day].orders / days[day].count) : 0,
    }))
  }, [dailySalesData])

  const weeklyData = useMemo(() => {
    const weeks: any[] = []
    let curr: any = null
    let wk = 1
    dailySalesData.forEach((d: any, i: number) => {
      const dow = getDayOfWeek(d.date)
      if (dow === 'Mon' || i === 0) {
        if (curr) weeks.push(curr)
        curr = { week: `Wk ${wk}`, start: d.date, sales: 0, orders: 0, days: 0 }
        wk++
      }
      if (curr) { curr.sales += d.totalSales; curr.orders += d.orders; curr.days++ }
    })
    if (curr) weeks.push(curr)
    return weeks.map(w => ({
      ...w,
      aov:      w.orders > 0 ? w.sales / w.orders : 0,
      avgDaily: w.sales / w.days,
    }))
  }, [dailySalesData])

  const aovData = useMemo(() =>
    dailySalesData.map((d: any) => ({
      date: d.date,
      dateLabel: formatDate(d.date),
      aov: d.orders > 0 ? d.totalSales / d.orders : 0,
      orders: d.orders,
    })), [dailySalesData])

  const totSales  = dailySalesData.reduce((s: number, d: any) => s + d.totalSales, 0)
  const totOrders = dailySalesData.reduce((s: number, d: any) => s + d.orders, 0)
  const avgAOV    = totOrders > 0 ? totSales / totOrders : 0
  const best      = dailySalesData.length > 0
    ? dailySalesData.reduce((b: any, d: any) => d.totalSales > b.totalSales ? d : b, dailySalesData[0])
    : { totalSales: 0, date: '', orders: 0 }
  const top5      = (productSalesData as any[]).slice(0, 5)

  const firstDate = dailySalesData[0]?.date
  const lastDate  = dailySalesData[dailySalesData.length - 1]?.date
  const periodLabel = firstDate && lastDate
    ? `${formatDate(firstDate)} - ${formatDate(lastDate)}`
    : 'Current period'

  const overviewData = {
    days: dailySalesData.length,
    totalSales: totSales,
    totalOrders: totOrders,
    aov: avgAOV,
    bestDay: best.totalSales,
    yoySales: yoyData.periodComparison.salesGrowth,
    yoyOrders: yoyData.periodComparison.orderGrowth,
    periodLabel,
  }

  return (
    <div className="space-y-5">

      {/* ── Snapshot cards ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        {[
          {
            icon: <TrendingUp size={15} />, color: 'oklch(0.70 0.14 228 / 0.1)', iconColor: 'var(--accent-blue)',
            label: 'Period Sales', value: formatCurrency(totSales, true),
            sub: `+${yoyData.periodComparison.salesGrowth.toFixed(0)}% vs 2025 same period`,
            subColor: 'var(--accent-green)',
          },
          {
            icon: <ShoppingBag size={15} />, color: 'oklch(0.76 0.12 55 / 0.1)', iconColor: 'var(--accent-peach)',
            label: 'Avg Order Value', value: formatCurrency(avgAOV),
            sub: `${formatNumber(totOrders)} orders · 2025 was ${formatCurrency(yoyData.periodComparison['2025'].aov)}`,
            subColor: 'var(--text-muted)',
          },
          {
            icon: <Calendar size={15} />, color: 'oklch(0.75 0.14 155 / 0.1)', iconColor: 'var(--accent-green)',
            label: 'Best Single Day', value: formatCurrency(best.totalSales),
            sub: `${getDayOfWeek(best.date)} · ${formatDate(best.date)}`,
            subColor: 'var(--text-muted)',
          },
          {
            icon: <Package size={15} />, color: 'oklch(0.68 0.13 290 / 0.1)', iconColor: 'var(--accent-lavender)',
            label: 'Top Product', value: top5[0]?.name ?? '-',
            sub: `${formatNumber(top5[0]?.unitsSold ?? 0)} units · ${formatCurrency(top5[0]?.totalSales ?? 0)}`,
            subColor: 'var(--text-muted)',
            small: true,
          },
        ].map((c, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg" style={{ background: c.color }}>{c.icon && <span style={{ color: c.iconColor }}>{c.icon}</span>}</div>
              <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{c.label}</span>
            </div>
            <div
              className={c.small ? 'font-display font-bold text-[15px] leading-snug' : 'font-display font-bold text-[26px]'}
              style={{ color: 'var(--text-primary)' }}
            >
              {c.value}
            </div>
            <p className="text-[11px] mt-1" style={{ color: c.subColor }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Executive summary rendered by Duck Norris */}
      <div className="card p-5" style={{ borderColor: 'oklch(0.78 0.13 198 / 0.12)' }}>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={15} style={{ color: 'var(--accent-primary)' }} />
          <h3 className="font-display font-bold text-[16px]" style={{ color: 'var(--text-primary)' }}>
            Executive Summary
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ml-1"
            style={{ background: 'oklch(0.78 0.13 198 / 0.08)', color: 'var(--accent-primary)', border: '1px solid oklch(0.78 0.13 198 / 0.18)' }}>
            Duck Norris
          </span>
        </div>
        <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>
          {periodLabel} · {dailySalesData.length} days · {formatCurrency(totSales, true)} revenue
        </p>
        <DuckInsight section="overview" data={overviewData} label="Generate Summary" buttonLabel="What the Duck?" />
      </div>

      {/* ── Charts row ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Day of week */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>Sales by Day</h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Average daily revenue · 2026 YTD</p>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a0a3b1' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b6f80' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="card p-3 shadow-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                        <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{d.day}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                          Avg Sales: <span className="font-mono" style={{ color: 'var(--text-primary)' }}>{formatCurrency(d.avgSales)}</span>
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                          Avg Orders: <span className="font-mono">{d.avgOrders}</span>
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                          $/Order: <span className="font-mono" style={{ color: 'var(--accent-peach)' }}>
                            {d.avgOrders > 0 ? formatCurrency(d.avgSales / d.avgOrders) : '-'}
                          </span>
                        </p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="avgSales" radius={[4, 4, 0, 0]}>
                  {dayOfWeekStats.map((e, i) => (
                    <Cell key={i} fill={e.day === 'Sat' || e.day === 'Fri' ? '#5badff' : 'rgba(91,173,255,0.38)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <DuckInsight section="dayOfWeek" data={dayOfWeekStats} />
        </div>

        {/* AOV trend */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>AOV Trend</h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Daily avg order value · 2026 YTD</p>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aovData}>
                <defs>
                  <linearGradient id="aovG2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.76 0.12 55)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="oklch(0.76 0.12 55)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: '#6b6f80' }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} interval={6} />
                <YAxis tick={{ fontSize: 10, fill: '#6b6f80' }} tickLine={false} axisLine={false} tickFormatter={v => `$${v.toFixed(0)}`} domain={['auto', 'auto']} />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="card p-3 shadow-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                        <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{formatDate(d.date)}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                          AOV: <span className="font-mono" style={{ color: 'var(--accent-peach)' }}>{formatCurrency(d.aov)}</span>
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                          Orders: <span className="font-mono">{d.orders}</span>
                        </p>
                      </div>
                    )
                  }}
                />
                <Area type="monotone" dataKey="aov" stroke="oklch(0.76 0.12 55)" strokeWidth={2} fill="url(#aovG2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <DuckInsight section="aov" data={aovData} />
        </div>
      </div>

      {/* ── Weekly performance ──────────────────────── */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>Weekly Performance</h3>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>2026 YTD · {weeklyData.length} weeks</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th className="text-left py-3 px-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Week</th>
                <th className="text-right py-3 px-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Revenue</th>
                <th className="text-right py-3 px-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Orders</th>
                <th className="text-right py-3 px-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>AOV</th>
                <th className="text-right py-3 px-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Avg/Day</th>
              </tr>
            </thead>
            <tbody>
              {weeklyData.map((w, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <td className="py-2.5 px-2">
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{w.week}</span>
                    <span className="ml-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatDate(w.start)}</span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(w.sales)}</td>
                  <td className="py-2.5 px-2 text-right font-mono" style={{ color: 'var(--text-secondary)' }}>{formatNumber(w.orders)}</td>
                  <td className="py-2.5 px-2 text-right font-mono" style={{ color: 'var(--accent-peach)' }}>{formatCurrency(w.aov)}</td>
                  <td className="py-2.5 px-2 text-right font-mono" style={{ color: 'var(--text-secondary)' }}>{formatCurrency(w.avgDaily)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <DuckInsight section="weekly" data={weeklyData} />
      </div>

      {/* ── Top products ────────────────────────────── */}
      <div className="card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-display font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>Product Spotlight</h3>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Top 5 by revenue · 2026 YTD</p>
          </div>
        </div>
        <div className="space-y-2">
          {top5.map((p: any, i: number) => {
            const pct = (p.totalSales / totSales) * 100
            return (
              <div key={i} className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center flex-shrink-0"
                      style={{ background: 'oklch(0.78 0.13 198 / 0.10)', color: 'var(--accent-primary)' }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[13px] font-mono font-bold" style={{ color: 'var(--accent-revenue)' }}>{formatCurrency(p.totalSales)}</span>
                    <span className="text-[10px] ml-2 font-mono" style={{ color: 'var(--text-muted)' }}>{formatNumber(p.unitsSold)} units</span>
                  </div>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: `var(--accent-revenue)`, opacity: 0.55 }}
                  />
                </div>
                <span className="text-[9px] mt-0.5 block" style={{ color: 'var(--text-muted)' }}>
                  {pct.toFixed(1)}% of period revenue
                </span>
              </div>
            )
          })}
        </div>
        <DuckInsight section="products" data={productSalesData} />
      </div>

    </div>
  )
}
