'use client'

import { useState, useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { CheckCircle, AlertTriangle, RotateCcw, Lock } from 'lucide-react'

type AllocationMode = 'percent' | 'flat' | 'remainder'

interface AllocationDef {
  key: string
  label: string
  color: string
  mode: AllocationMode
  pct: number        // percent mode: the % value; others: 0
  flatAmount: number // flat mode: the $ amount; others: 0
  min: number        // percent mode: min %; flat mode: min $
  max: number        // percent mode: max %; flat mode: max $
  target: number     // percent mode: target %; flat mode: target $
}

type ComputedAllocation = AllocationDef & {
  weeklyAmount: number
  effectivePct: number
  monthlyAmount: number
  annualAmount: number
}

const INITIAL: AllocationDef[] = [
  { key: 'profit',       label: 'Profit',        color: '#2ee89a', mode: 'percent',   pct: 7.5,  flatAmount: 0,     min: 0,    max: 20,    target: 7.5   },
  { key: 'cashReserves', label: 'Cash Reserves', color: '#ff9a3c', mode: 'percent',   pct: 7.5,  flatAmount: 0,     min: 0,    max: 20,    target: 7.5   },
  { key: 'ownersPay',    label: "Owner's Pay",   color: '#d4918a', mode: 'percent',   pct: 1.0,  flatAmount: 0,     min: 0,    max: 15,    target: 1.0   },
  { key: 'salesTax',     label: 'Sales Tax',     color: '#9d78ff', mode: 'percent',   pct: 8.0,  flatAmount: 0,     min: 5,    max: 12,    target: 8.0   },
  { key: 'payroll',      label: 'Payroll',       color: '#ff6eb3', mode: 'flat',      pct: 0,    flatAmount: 14000, min: 8000, max: 22000, target: 14000 },
  { key: 'operating',    label: 'Operating',     color: '#64748b', mode: 'flat',      pct: 0,    flatAmount: 6500,  min: 3000, max: 12000, target: 6500  },
  { key: 'inventory',    label: 'Inventory',     color: '#5badff', mode: 'remainder', pct: 0,    flatAmount: 0,     min: 0,    max: 0,     target: 0     },
]

const DEFAULT_WEEKLY_REV = 62000

export default function ProfitFirstAllocator() {
  const [weeklyRev, setWeeklyRev] = useState(DEFAULT_WEEKLY_REV)
  const [sliders, setSliders] = useState<AllocationDef[]>(INITIAL)

  const allocations = useMemo<ComputedAllocation[]>(() => {
    let fixedTotal = 0
    const withAmounts = sliders
      .filter(s => s.mode !== 'remainder')
      .map(s => {
        const weeklyAmount = s.mode === 'percent'
          ? (weeklyRev * s.pct) / 100
          : s.flatAmount
        fixedTotal += weeklyAmount
        const effectivePct = weeklyRev > 0 ? (weeklyAmount / weeklyRev) * 100 : 0
        return { ...s, weeklyAmount, effectivePct, monthlyAmount: weeklyAmount * 4.33, annualAmount: weeklyAmount * 52 }
      })
    const remainder = weeklyRev - fixedTotal
    const inventoryDef = sliders.find(s => s.mode === 'remainder')!
    const inventoryItem: ComputedAllocation = {
      ...inventoryDef,
      weeklyAmount: remainder,
      effectivePct: weeklyRev > 0 ? (remainder / weeklyRev) * 100 : 0,
      monthlyAmount: remainder * 4.33,
      annualAmount: remainder * 52,
    }
    return [...withAmounts, inventoryItem]
  }, [sliders, weeklyRev])

  const inventoryAlloc = allocations.find(a => a.key === 'inventory')!
  const over = inventoryAlloc.weeklyAmount < 0
  const balanced = !over

  const fixedTotal = allocations
    .filter(a => a.mode !== 'remainder')
    .reduce((s, a) => s + a.weeklyAmount, 0)

  const updatePct = (key: string, val: number) =>
    setSliders(prev => prev.map(s => s.key === key ? { ...s, pct: val } : s))
  const updateFlat = (key: string, val: number) =>
    setSliders(prev => prev.map(s => s.key === key ? { ...s, flatAmount: val } : s))
  const reset = () => { setSliders(INITIAL); setWeeklyRev(DEFAULT_WEEKLY_REV) }

  const monthlyRev = weeklyRev * 4.33
  const annualRev  = weeklyRev * 52

  const pieData = allocations
    .filter(a => a.weeklyAmount > 0)
    .map(a => ({ name: a.label, value: a.weeklyAmount, color: a.color }))

  const statusColor  = balanced ? 'var(--accent-green)' : 'var(--accent-red)'
  const statusBg     = balanced ? 'rgba(46,232,154,0.05)' : 'rgba(255,82,82,0.05)'
  const statusBorder = balanced ? 'rgba(46,232,154,0.18)' : 'rgba(255,82,82,0.18)'

  return (
    <div className="space-y-5">

      {/* ── Revenue Hero ─────────────────────────── */}
      <div className="card p-6" style={{ borderColor: 'oklch(0.72 0.10 15 / 0.12)' }}>
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
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-rose)'; e.currentTarget.style.borderColor = 'oklch(0.72 0.10 15 / 0.22)' }}
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
          : <AlertTriangle size={16} style={{ color: statusColor }} />
        }
        <span className="text-[13px] font-semibold" style={{ color: statusColor }}>
          {formatCurrency(fixedTotal)} allocated
        </span>
        <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
          {balanced
            ? `— ${formatCurrency(inventoryAlloc.weeklyAmount)} (${inventoryAlloc.effectivePct.toFixed(1)}%) remaining for inventory`
            : `— over by ${formatCurrency(Math.abs(inventoryAlloc.weeklyAmount))} — reduce allocations`
          }
        </span>
      </div>

      {/* ── Allocation Grid + Chart ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Allocation cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allocations.map(a => {
            const isRemainder = a.mode === 'remainder'
            const isFlat = a.mode === 'flat'
            const isPct = a.mode === 'percent'
            const isNegative = isRemainder && a.weeklyAmount < 0

            const fillPct = isFlat
              ? Math.max(0, Math.min(100, ((a.flatAmount - a.min) / (a.max - a.min)) * 100))
              : isPct
                ? Math.max(0, Math.min(100, ((a.pct - a.min) / (a.max - a.min)) * 100))
                : 0

            const atTarget = isFlat
              ? Math.abs(a.flatAmount - a.target) <= 250
              : isPct
                ? Math.abs(a.pct - a.target) < 0.5
                : false

            const accentColor = isNegative ? 'var(--accent-red)' : a.color

            return (
              <div
                key={a.key}
                className="card p-5"
                style={{
                  borderLeft: `3px solid ${isNegative ? 'rgba(255,82,82,0.5)' : a.color + '50'}`,
                  background: 'linear-gradient(135deg, var(--bg-secondary) 0%, rgba(22,26,48,1) 100%)',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: accentColor, boxShadow: `0 0 8px ${accentColor}80` }}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                      {a.label}
                    </span>
                    {isFlat && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                        FLAT $
                      </span>
                    )}
                    {isRemainder && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(91,173,255,0.08)', color: 'var(--accent-blue)', border: '1px solid rgba(91,173,255,0.18)' }}>
                        REMAINDER
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {atTarget && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(46,232,154,0.1)', color: 'var(--accent-green)', border: '1px solid rgba(46,232,154,0.18)' }}
                      >
                        TARGET
                      </span>
                    )}
                    <span className="font-mono font-bold text-[17px]" style={{ color: accentColor }}>
                      {a.effectivePct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Big weekly amount */}
                <div className="mb-3">
                  <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>Weekly</p>
                  <p className="font-display font-bold text-[30px] leading-none" style={{ color: isNegative ? 'var(--accent-red)' : 'var(--text-primary)' }}>
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

                {/* Controls — percent and flat modes only */}
                {!isRemainder && (
                  <>
                    {/* Slider */}
                    {isPct && (
                      <>
                        <input
                          type="range"
                          min={a.min * 10} max={a.max * 10} step={1}
                          value={a.pct * 10}
                          onChange={e => updatePct(a.key, Number(e.target.value) / 10)}
                          className="w-full"
                          style={{ background: `linear-gradient(to right, ${a.color}55 ${fillPct}%, rgba(255,255,255,0.06) ${fillPct}%)` }}
                        />
                        <div className="flex justify-between mt-1 mb-3">
                          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{a.min}%</span>
                          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Target {a.target}%</span>
                          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{a.max}%</span>
                        </div>
                      </>
                    )}
                    {isFlat && (
                      <>
                        <input
                          type="range"
                          min={a.min} max={a.max} step={250}
                          value={a.flatAmount}
                          onChange={e => updateFlat(a.key, Number(e.target.value))}
                          className="w-full"
                          style={{ background: `linear-gradient(to right, ${a.color}55 ${fillPct}%, rgba(255,255,255,0.06) ${fillPct}%)` }}
                        />
                        <div className="flex justify-between mt-1 mb-3">
                          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{formatCurrency(a.min, true)}</span>
                          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Target {formatCurrency(a.target, true)}</span>
                          <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{formatCurrency(a.max, true)}</span>
                        </div>
                      </>
                    )}

                    {/* Manual typed input */}
                    <div className="relative">
                      {isFlat && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: 'var(--text-muted)' }}>$</span>
                      )}
                      <input
                        type="number"
                        value={isPct ? a.pct : a.flatAmount}
                        step={isPct ? 0.1 : 250}
                        onChange={e => {
                          const val = parseFloat(e.target.value)
                          if (isNaN(val)) return
                          if (isPct) updatePct(a.key, Math.max(0, Math.min(val, a.max)))
                          else updateFlat(a.key, Math.max(0, val))
                        }}
                        className="w-full rounded-lg py-2 font-mono text-[12px] focus:outline-none transition-all text-right pr-3"
                        style={{
                          paddingLeft: isFlat ? '28px' : '12px',
                          background: 'rgba(255,255,255,0.04)',
                          border: `1px solid ${a.color}30`,
                          color: 'var(--text-primary)',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = `${a.color}70` }}
                        onBlur={e => { e.currentTarget.style.borderColor = `${a.color}30` }}
                      />
                      {isPct && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: 'var(--text-muted)' }}>%</span>
                      )}
                    </div>
                  </>
                )}

                {/* Remainder: calculated note */}
                {isRemainder && (
                  <div
                    className="rounded-lg px-3 py-2 flex items-center gap-2"
                    style={{
                      background: isNegative ? 'rgba(255,82,82,0.06)' : 'rgba(91,173,255,0.06)',
                      border: `1px solid ${isNegative ? 'rgba(255,82,82,0.15)' : 'rgba(91,173,255,0.12)'}`,
                    }}
                  >
                    <Lock size={10} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {isNegative
                        ? 'Over budget — reduce other allocations to free up inventory funds'
                        : 'Calculated automatically — whatever remains after all other allocations'
                      }
                    </span>
                  </div>
                )}
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
                    {pieData.map((e: { name: string; value: number; color: string }, i: number) => (
                      <Cell key={i} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }: any) => {
                      if (!active || !payload?.length) return null
                      const pct = weeklyRev > 0 ? ((payload[0].value / weeklyRev) * 100).toFixed(1) : '0.0'
                      return (
                        <div className="card p-2.5 shadow-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                          <span className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>{payload[0].name}</span>
                          <span className="text-[11px] font-mono ml-2" style={{ color: 'var(--text-muted)' }}>
                            {formatCurrency(payload[0].value)} ({pct}%)
                          </span>
                        </div>
                      )
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p
                    className="font-display font-bold text-[20px] leading-none"
                    style={{ color: balanced ? '#5badff' : 'var(--accent-red)' }}
                  >
                    {inventoryAlloc.effectivePct.toFixed(1)}%
                  </p>
                  <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>inventory</p>
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
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: a.mode === 'remainder' && a.weeklyAmount < 0 ? 'var(--accent-red)' : a.color }}
                    />
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{a.label}</span>
                    {a.mode === 'flat' && (
                      <span className="text-[8px] font-bold" style={{ color: 'var(--text-muted)' }}>FLAT</span>
                    )}
                  </div>
                  <span
                    className="text-[12px] font-mono font-semibold"
                    style={{ color: a.mode === 'remainder' && a.weeklyAmount < 0 ? 'var(--accent-red)' : 'var(--text-primary)' }}
                  >
                    {formatCurrency(a.weeklyAmount)}
                  </span>
                </div>
              ))}
              <div
                className="pt-3 mt-1 flex items-center justify-between"
                style={{ borderTop: '1px solid var(--border-subtle)' }}
              >
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Revenue / wk</span>
                <span className="text-[15px] font-mono font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(weeklyRev)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Monthly est.</span>
                <span className="text-[12px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {formatCurrency(monthlyRev, true)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
