'use client'

import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, AlertTriangle, Info, RotateCcw } from 'lucide-react'

interface SliderDef {
  key: string
  label: string
  color: string
  pct: number
  min: number
  max: number
  target: number
}

const INITIAL: SliderDef[] = [
  { key: 'profit',     label: 'Profit',             color: '#2ee89a', pct: 5,    min: 0,  max: 20, target: 10 },
  { key: 'ownersPay', label: "Owner's Pay",         color: '#e8b840', pct: 1.5,  min: 0,  max: 15, target: 5  },
  { key: 'inventory', label: 'Inventory',           color: '#5badff', pct: 47,   min: 25, max: 60, target: 45 },
  { key: 'salesTax',  label: 'Sales Tax',           color: '#9d78ff', pct: 8,    min: 5,  max: 12, target: 8  },
  { key: 'payroll',   label: 'Payroll',             color: '#ff6eb3', pct: 26,   min: 15, max: 40, target: 25 },
  { key: 'operating', label: 'Operating',           color: '#64748b', pct: 12.5, min: 5,  max: 20, target: 12 },
]

const DEFAULT_WEEKLY_REV = 62000

export default function ProfitFirstAllocator() {
  const [weeklyRev, setWeeklyRev] = useState(DEFAULT_WEEKLY_REV)
  const [sliders, setSliders] = useState(INITIAL)

  const totalPct = useMemo(() => sliders.reduce((s, sl) => s + sl.pct, 0), [sliders])
  const unalloc   = 100 - totalPct
  const balanced  = Math.abs(totalPct - 100) < 0.5
  const over      = totalPct > 100

  const allocations = useMemo(() =>
    sliders.map(s => ({
      ...s,
      weeklyAmount:  (weeklyRev * s.pct) / 100,
      monthlyAmount: (weeklyRev * s.pct) / 100 * 4.33,
      annualAmount:  (weeklyRev * s.pct) / 100 * 52,
      atTarget:      Math.abs(s.pct - s.target) < 0.5,
    })),
    [sliders, weeklyRev]
  )

  const update = (key: string, val: number) =>
    setSliders(prev => prev.map(s => s.key === key ? { ...s, pct: val } : s))

  const reset = () => { setSliders(INITIAL); setWeeklyRev(DEFAULT_WEEKLY_REV) }

  const monthlyRev = weeklyRev * 4.33
  const annualRev  = weeklyRev * 52

  const pieData = [
    ...allocations.map(a => ({ name: a.label, value: a.pct, color: a.color })),
    ...(unalloc > 0.5 ? [{ name: 'Unallocated', value: unalloc, color: 'rgba(255,255,255,0.05)' }] : []),
  ]

  const statusColor  = balanced ? 'var(--accent-green)' : over ? 'var(--accent-red)' : 'var(--accent-amber)'
  const statusBg     = balanced ? 'rgba(46,232,154,0.05)'  : over ? 'rgba(255,82,82,0.05)'  : 'rgba(232,184,64,0.05)'
  const statusBorder = balanced ? 'rgba(46,232,154,0.18)' : over ? 'rgba(255,82,82,0.18)' : 'rgba(232,184,64,0.18)'

  return (
    <div className="space-y-5">

      {/* ── Revenue Hero ─────────────────────────── */}
      <div className="card p-6" style={{ borderColor: 'rgba(232,184,64,0.14)' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Weekly Revenue Baseline
            </p>
            <div className="flex items-baseline gap-3">
              <span className="font-display font-bold text-[44px] leading-none shimmer-text">
                {formatCurrency(weeklyRev)}
              </span>
              <span className="text-[15px]" style={{ color: 'var(--text-muted)' }}>/week</span>
            </div>
          </div>
          <button
            onClick={reset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all"
            style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-gold)'; e.currentTarget.style.borderColor = 'rgba(232,184,64,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)';  e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>

        <input
          type="range" min={30000} max={100000} step={1000} value={weeklyRev}
          onChange={e => setWeeklyRev(Number(e.target.value))}
          className="w-full mb-1.5"
        />
        <div className="flex justify-between text-[10px] mb-5" style={{ color: 'var(--text-muted)' }}>
          <span>$30K/wk</span><span>$65K/wk</span><span>$100K/wk</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Enter Exact
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px]" style={{ color: 'var(--text-muted)' }}>$</span>
              <input
                type="number"
                value={weeklyRev}
                onChange={e => setWeeklyRev(Number(e.target.value) || 0)}
                className="w-full rounded-lg px-3 pl-7 py-2.5 font-mono text-[13px] focus:outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>
          <div
            className="rounded-xl p-3.5 text-center"
            style={{ background: 'rgba(91,173,255,0.06)', border: '1px solid rgba(91,173,255,0.12)' }}
          >
            <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Est. Monthly</p>
            <p className="font-display font-bold text-[22px] leading-none" style={{ color: 'var(--accent-blue)' }}>
              {formatCurrency(monthlyRev, true)}
            </p>
          </div>
          <div
            className="rounded-xl p-3.5 text-center"
            style={{ background: 'rgba(46,232,154,0.06)', border: '1px solid rgba(46,232,154,0.12)' }}
          >
            <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Projected Annual</p>
            <p className="font-display font-bold text-[22px] leading-none" style={{ color: 'var(--accent-green)' }}>
              {formatCurrency(annualRev, true)}
            </p>
          </div>
        </div>
      </div>

      {/* ── Balance Status ───────────────────────── */}
      <div
        className="card px-5 py-3.5 flex items-center gap-3"
        style={{ background: statusBg, borderColor: statusBorder }}
      >
        {balanced
          ? <CheckCircle size={16} style={{ color: statusColor }} />
          : over
            ? <AlertTriangle size={16} style={{ color: statusColor }} />
            : <Info size={16} style={{ color: statusColor }} />
        }
        <span className="text-[13px] font-semibold" style={{ color: statusColor }}>
          {totalPct.toFixed(1)}% allocated
        </span>
        <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          {balanced
            ? '— Perfectly balanced'
            : unalloc > 0
              ? `— ${unalloc.toFixed(1)}% unallocated`
              : `— ${Math.abs(unalloc).toFixed(1)}% over budget`
          }
        </span>
      </div>

      {/* ── Allocation Grid + Chart ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Allocation cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allocations.map(a => {
            const fillPct = ((a.pct - a.min) / (a.max - a.min)) * 100
            return (
              <div
                key={a.key}
                className="card p-5"
                style={{
                  borderLeft: `3px solid ${a.color}50`,
                  background: `linear-gradient(135deg, var(--bg-secondary) 0%, rgba(22,26,48,1) 100%)`,
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: a.color, boxShadow: `0 0 8px ${a.color}80` }}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      {a.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {a.atTarget && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(46,232,154,0.1)', color: 'var(--accent-green)', border: '1px solid rgba(46,232,154,0.18)' }}
                      >
                        TARGET
                      </span>
                    )}
                    <span className="font-mono font-bold text-[17px]" style={{ color: a.color }}>
                      {a.pct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Big weekly amount */}
                <div className="mb-3">
                  <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Weekly</p>
                  <p className="font-display font-bold text-[30px] leading-none" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(a.weeklyAmount)}
                  </p>
                </div>

                {/* Monthly + annual */}
                <div className="flex gap-5 mb-4">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Monthly</p>
                    <p className="font-mono text-[13px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {formatCurrency(a.monthlyAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Annual</p>
                    <p className="font-mono text-[13px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {formatCurrency(a.annualAmount, true)}
                    </p>
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={a.min * 10} max={a.max * 10} step={1}
                  value={a.pct * 10}
                  onChange={e => update(a.key, Number(e.target.value) / 10)}
                  className="w-full"
                  style={{
                    background: `linear-gradient(to right, ${a.color}55 ${fillPct}%, rgba(255,255,255,0.06) ${fillPct}%)`
                  }}
                />
                <div className="flex justify-between mt-1.5">
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{a.min}%</span>
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                    Target {a.target}%
                  </span>
                  <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{a.max}%</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Pie chart + summary */}
        <div className="space-y-4">
          <div className="card p-5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
              Allocation Mix
            </h4>
            <div className="relative h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={65} outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={400}
                  >
                    {pieData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null
                      return (
                        <div className="card p-2.5 shadow-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                          <span className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>{payload[0].name}</span>
                          <span className="text-[11px] font-mono ml-2" style={{ color: 'var(--text-muted)' }}>{payload[0].value.toFixed(1)}%</span>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p
                    className="font-display font-bold text-[22px] leading-none"
                    style={{ color: balanced ? 'var(--accent-green)' : over ? 'var(--accent-red)' : 'var(--text-primary)' }}
                  >
                    {totalPct.toFixed(0)}%
                  </p>
                  <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>allocated</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest mb-3.5" style={{ color: 'var(--text-muted)' }}>
              Weekly Breakdown
            </h4>
            <div className="space-y-2.5">
              {allocations.map(a => (
                <div key={a.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{a.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[12px] font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(a.weeklyAmount)}
                    </span>
                  </div>
                </div>
              ))}
              <div
                className="pt-3 mt-1 flex items-center justify-between"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Total / wk</span>
                <span className="text-[15px] font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(allocations.reduce((s, a) => s + a.weeklyAmount, 0))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Monthly est.</span>
                <span className="text-[12px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {formatCurrency(allocations.reduce((s, a) => s + a.monthlyAmount, 0), true)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
