'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatNumber } from '@/lib/utils'
import allData from '@/data/categoryBreakdown.json'

type ViewMode = 'categories' | 'specialty'

const YEAR_COLORS: Record<string, string> = {
  '2024':     '#e8b840',
  '2025':     '#5badff',
  '2026 YTD': '#2ee89a',
}

export default function RevenueBreakdown() {
  const [mode, setMode]       = useState<ViewMode>('categories')
  const [active, setActive]   = useState<Set<string>>(new Set<string>())

  const data2024 = (allData as any)['2024']
  const data2025 = (allData as any)['2025']
  const data2026 = (allData as any)['2026']
  const specialty = data2026.specialty

  const toggleYear = (yr: string) =>
    setActive(prev => {
      const next = new Set(prev)
      next.has(yr) ? next.delete(yr) : next.add(yr)
      return next
    })

  // Always include 2026; add comparison years if toggled on
  const chartData = data2026.categories.map((cat: any, i: number) => ({
    name:      cat.name.replace('Health & Beauty', 'H&B').replace('Shoes/Footwear', 'Shoes').replace('General Merch', 'Gen. Merch'),
    fullName:  cat.name,
    '2024':     data2024.categories[i]?.totalSales ?? 0,
    '2025':     data2025.categories[i]?.totalSales ?? 0,
    '2026 YTD': cat.totalSales,
    color:      cat.color,
  }))

  const visibleYears: string[] = [
    ...(active.has('2024') ? ['2024'] : []),
    ...(active.has('2025') ? ['2025'] : []),
    '2026 YTD',
  ]

  const barSize = visibleYears.length === 1 ? 14 : visibleYears.length === 2 ? 10 : 8

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h3 className="font-display font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>
            Revenue Breakdown
          </h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {mode === 'categories'
              ? active.size === 0
                ? '2026 YTD · Jan 1–Feb 23'
                : `2026 YTD vs ${[...active].join(' & ')} · 2026 is Jan–Feb only`
              : 'Specialty items by price point · 2026 YTD'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Year comparison toggles (only on categories view) */}
          {mode === 'categories' && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Compare vs
              </span>
              <div className="toggle-group">
                {(['2025', '2024'] as const).map(yr => (
                  <button
                    key={yr}
                    onClick={() => toggleYear(yr)}
                    className={`toggle-btn ${active.has(yr) ? 'active' : ''}`}
                    style={active.has(yr) ? { background: `${YEAR_COLORS[yr]}20`, color: YEAR_COLORS[yr], boxShadow: `0 0 10px ${YEAR_COLORS[yr]}18` } : {}}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* View mode toggle */}
          <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}>
            {([
              { key: 'categories', label: 'Categories' },
              { key: 'specialty',  label: 'Specialty' },
            ] as { key: ViewMode; label: string }[]).map(m => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className="px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all"
                style={{
                  background: mode === m.key ? 'rgba(91,173,255,0.12)' : 'transparent',
                  color:      mode === m.key ? 'var(--accent-blue)'    : 'var(--text-muted)',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {mode === 'categories' ? (
        <>
          {/* Year color legend — only visible when comparing */}
          {active.size > 0 && (
            <div className="flex items-center gap-4 mb-3">
              {visibleYears.map(yr => (
                <div key={yr} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: YEAR_COLORS[yr] }} />
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>{yr}</span>
                </div>
              ))}
              <span className="text-[10px] ml-auto italic" style={{ color: 'var(--text-muted)' }}>
                * 2024 &amp; 2025 = full year
              </span>
            </div>
          )}

          <div style={{ height: active.size === 2 ? 440 : active.size === 1 ? 380 : 310 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 0, right: 20, top: 0, bottom: 0 }}
                barCategoryGap="22%"
                barGap={2}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#6b6f80' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 10, fill: '#9299b8' }}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={({ active: a, payload }: any) => {
                    if (!a || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="card p-3 shadow-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', minWidth: 190 }}>
                        <p className="text-[12px] font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{d.fullName}</p>
                        {visibleYears.map(yr => (
                          <div key={yr} className="flex items-center justify-between gap-4 mb-0.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-sm" style={{ background: YEAR_COLORS[yr] }} />
                              <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{yr}</span>
                            </div>
                            <span className="text-[11px] font-mono font-semibold" style={{ color: YEAR_COLORS[yr] }}>
                              {formatCurrency(d[yr])}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  }}
                />

                {/* Render bars only for visible years */}
                {active.has('2024') && (
                  <Bar dataKey="2024"     barSize={barSize} fill={YEAR_COLORS['2024']}     fillOpacity={0.7} radius={[0, 3, 3, 0]} />
                )}
                {active.has('2025') && (
                  <Bar dataKey="2025"     barSize={barSize} fill={YEAR_COLORS['2025']}     fillOpacity={0.7} radius={[0, 3, 3, 0]} />
                )}
                <Bar dataKey="2026 YTD"  barSize={barSize} fill={YEAR_COLORS['2026 YTD']} fillOpacity={0.9} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Totals summary row — compare or standalone */}
          {active.size > 0 ? (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                active.has('2024') && { yr: '2024',     data: data2024, label: 'Full Year 2024' },
                active.has('2025') && { yr: '2025',     data: data2025, label: 'Full Year 2025' },
                { yr: '2026 YTD', data: data2026, label: '2026 YTD (Jan–Feb)' },
              ].filter(Boolean).map((entry: any) => (
                <div key={entry.yr} className="rounded-lg p-3" style={{ background: `${YEAR_COLORS[entry.yr]}08`, border: `1px solid ${YEAR_COLORS[entry.yr]}18` }}>
                  <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: YEAR_COLORS[entry.yr] }}>{entry.label}</p>
                  <p className="font-mono font-bold text-[15px]" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(entry.data.totalAllCategories, true)}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {formatNumber(entry.data.totalUnits)} units
                  </p>
                </div>
              ))}
            </div>
          ) : (
            /* Single-year quick stats */
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-lg p-3" style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.1)' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--accent-amber)' }}>Specialty Items</p>
                <p className="font-mono text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(specialty.totalSales)}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {specialty.pctOfTotal}% of sales · {formatNumber(specialty.units)} units
                </p>
              </div>
              <div className="rounded-lg p-3" style={{ background: 'rgba(91,173,255,0.06)', border: '1px solid rgba(91,173,255,0.1)' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--accent-blue)' }}>Everything Else</p>
                <p className="font-mono text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(data2026.totalAllCategories - specialty.totalSales)}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {(100 - specialty.pctOfTotal).toFixed(1)}% of sales · {formatNumber(data2026.totalUnits - specialty.units)} units
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg p-3.5" style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.12)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Total Specialty Revenue</p>
              <p className="font-display font-bold text-[22px]" style={{ color: 'var(--accent-amber)' }}>
                {formatCurrency(specialty.totalSales)}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>2026 YTD · Jan 1–Feb 23</p>
            </div>
            <div className="rounded-lg p-3.5" style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.12)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Avg Price Per Unit</p>
              <p className="font-display font-bold text-[22px]" style={{ color: 'var(--accent-amber)' }}>
                ${specialty.avgPricePerUnit.toFixed(2)}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{formatNumber(specialty.units)} units sold</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th className="text-left py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Price Point</th>
                  <th className="text-right py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Units</th>
                  <th className="text-right py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Net Sales</th>
                  <th className="text-right py-2.5 px-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>% of Specialty</th>
                </tr>
              </thead>
              <tbody>
                {specialty.items.map((item: any, i: number) => (
                  <tr
                    key={i}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <td className="py-2 px-2 font-semibold" style={{ color: 'var(--text-primary)' }}>{item.price} Specialty</td>
                    <td className="py-2 px-2 text-right font-mono" style={{ color: 'var(--text-secondary)' }}>{formatNumber(item.units)}</td>
                    <td className="py-2 px-2 text-right font-mono" style={{ color: 'var(--accent-amber)' }}>{formatCurrency(item.netSales)}</td>
                    <td className="py-2 px-2 text-right font-mono" style={{ color: 'var(--text-muted)' }}>
                      {(item.netSales / specialty.netSales * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <td className="py-2.5 px-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>Total</td>
                  <td className="py-2.5 px-2 text-right font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{formatNumber(specialty.units)}</td>
                  <td className="py-2.5 px-2 text-right font-mono font-bold" style={{ color: 'var(--accent-amber)' }}>{formatCurrency(specialty.netSales)}</td>
                  <td className="py-2.5 px-2 text-right font-mono" style={{ color: 'var(--text-muted)' }}>100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
