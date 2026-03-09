'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine, Cell } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Target, RotateCcw, DollarSign, Calculator } from 'lucide-react'
import { useDashboardData } from '@/context/DashboardData'

type Mode = 'forward' | 'reverse'

const SPEND_SCENARIOS = [250, 500, 1000, 2000, 5000]

export default function AdROICalculator() {
  const [mode, setMode] = useState<Mode>('forward')

  // Forward calculator state
  const [adSpend, setAdSpend]   = useState(1000)
  const [duration, setDuration] = useState(2)
  const [liftPct, setLiftPct]   = useState(5)

  // Reverse calculator state
  const [targetRevenue, setTargetRevenue] = useState(3000)
  const [efficiency, setEfficiency]       = useState(3.0) // $ revenue per $ spent
  const [revDuration, setRevDuration]     = useState(2)

  const { data } = useDashboardData()
  const dailySalesData = data.dailySales

  const reset = () => {
    setAdSpend(1000); setDuration(2); setLiftPct(5)
    setTargetRevenue(3000); setEfficiency(3.0); setRevDuration(2)
  }

  // Compute baselines from daily sales data
  const baselines = useMemo(() => {
    const days = dailySalesData.length
    const totalSales  = dailySalesData.reduce((s: number, d: any) => s + d.totalSales, 0)
    const totalOrders = dailySalesData.reduce((s: number, d: any) => s + d.orders, 0)
    const avgWeeklyRev    = days > 0 ? (totalSales / days) * 7 : 0
    const avgAOV          = totalOrders > 0 ? totalSales / totalOrders : 0
    const avgWeeklyOrders = days > 0 ? (totalOrders / days) * 7 : 0
    return { avgWeeklyRev, avgAOV, avgWeeklyOrders }
  }, [dailySalesData])

  // Forward calculations
  const forwardCalc = useMemo(() => {
    const additionalRevenue = baselines.avgWeeklyRev * (liftPct / 100) * duration
    const netGain    = additionalRevenue - adSpend
    const roi        = adSpend > 0 ? (netGain / adSpend) * 100 : 0
    const roiRatio   = adSpend > 0 ? additionalRevenue / adSpend : 0
    const breakEvenLift = baselines.avgWeeklyRev > 0
      ? (adSpend / (baselines.avgWeeklyRev * duration)) * 100
      : 0
    return { additionalRevenue, netGain, roi, roiRatio, breakEvenLift }
  }, [baselines.avgWeeklyRev, liftPct, duration, adSpend])

  // Reverse calculations
  const reverseCalc = useMemo(() => {
    const requiredSpend    = efficiency > 0 ? targetRevenue / efficiency : 0
    const requiredLiftPct  = baselines.avgWeeklyRev > 0
      ? (targetRevenue / revDuration / baselines.avgWeeklyRev) * 100
      : 0
    const costPerDollar = targetRevenue > 0 ? requiredSpend / targetRevenue : 0
    return { requiredSpend, requiredLiftPct, costPerDollar }
  }, [targetRevenue, efficiency, revDuration, baselines.avgWeeklyRev])

  // Scenario chart data — fixed lift% per $1k spent (linear assumption)
  const liftPerKDollar = adSpend > 0 ? liftPct / (adSpend / 1000) : 5
  const scenarioData = SPEND_SCENARIOS.map(spend => {
    const scenarioLift   = liftPerKDollar * (spend / 1000)
    const addlRev = baselines.avgWeeklyRev * (scenarioLift / 100) * duration
    const net     = addlRev - spend
    return { spend: `$${spend >= 1000 ? spend / 1000 + 'k' : spend}`, addlRev, spend_raw: spend, net, positive: net >= 0 }
  })

  return (
    <div className="space-y-5">

      {/* ── Baseline Metrics ─────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Avg Weekly Revenue',  value: formatCurrency(baselines.avgWeeklyRev, true), color: 'var(--accent-gold)',   bg: 'rgba(232,184,64,0.06)',  border: 'rgba(232,184,64,0.14)' },
          { label: 'Avg Order Value',     value: formatCurrency(baselines.avgAOV),              color: 'var(--accent-blue)',   bg: 'rgba(91,173,255,0.06)',  border: 'rgba(91,173,255,0.14)' },
          { label: 'Avg Weekly Orders',   value: Math.round(baselines.avgWeeklyOrders).toString(), color: 'var(--accent-green)', bg: 'rgba(46,232,154,0.06)',  border: 'rgba(46,232,154,0.14)' },
        ].map(m => (
          <div key={m.label} className="card p-4 text-center" style={{ background: m.bg, borderColor: m.border }}>
            <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
            <p className="font-display font-bold text-[26px] leading-none" style={{ color: m.color }}>{m.value}</p>
            <p className="text-[9px] mt-1" style={{ color: 'var(--text-muted)' }}>2026 YTD avg</p>
          </div>
        ))}
      </div>

      {/* ── Data Notice ──────────────────────────── */}
      <div
        className="card px-5 py-3 flex items-center gap-3"
        style={{ borderColor: 'rgba(232,184,64,0.14)', background: 'rgba(232,184,64,0.04)' }}
      >
        <TrendingUp size={14} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
          No historical ad data yet — projections are based on your assumptions. Log real campaign results over time to sharpen accuracy.
        </p>
      </div>

      {/* ── Mode Toggle ──────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="toggle-group">
          <button className={`toggle-btn ${mode === 'forward' ? 'active' : ''}`} onClick={() => setMode('forward')}>
            Plan a Campaign
          </button>
          <button className={`toggle-btn ${mode === 'reverse' ? 'active' : ''}`} onClick={() => setMode('reverse')}>
            Set a Goal
          </button>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-semibold transition-all ml-auto"
          style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-gold)'; e.currentTarget.style.borderColor = 'rgba(232,184,64,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)';  e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* ── Forward Calculator ───────────────────── */}
      {mode === 'forward' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Inputs */}
          <div className="card p-6 space-y-5">
            <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Campaign Details
            </h3>

            {/* Ad Spend */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Ad Spend</label>
                <div className="relative w-28">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: 'var(--text-muted)' }}>$</span>
                  <input
                    type="number" value={adSpend} step={100} min={0}
                    onChange={e => setAdSpend(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full rounded-lg py-1.5 pl-6 pr-2 font-mono text-[12px] text-right focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(232,184,64,0.25)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <input type="range" min={0} max={10000} step={100} value={adSpend}
                onChange={e => setAdSpend(Number(e.target.value))}
                className="w-full"
                style={{ background: `linear-gradient(to right, rgba(232,184,64,0.5) ${adSpend / 100}%, rgba(255,255,255,0.06) ${adSpend / 100}%)` }}
              />
              <div className="flex justify-between mt-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                <span>$0</span><span>$5k</span><span>$10k</span>
              </div>
            </div>

            {/* Duration */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Campaign Duration</label>
                <div className="relative w-28">
                  <input
                    type="number" value={duration} step={1} min={1} max={12}
                    onChange={e => setDuration(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
                    className="w-full rounded-lg py-1.5 px-2 font-mono text-[12px] text-right focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(91,173,255,0.25)', color: 'var(--text-primary)' }}
                  />
                  <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: 'var(--text-muted)' }}>wk</span>
                </div>
              </div>
              <input type="range" min={1} max={12} step={1} value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full"
                style={{ background: `linear-gradient(to right, rgba(91,173,255,0.5) ${(duration - 1) / 11 * 100}%, rgba(255,255,255,0.06) ${(duration - 1) / 11 * 100}%)` }}
              />
              <div className="flex justify-between mt-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                <span>1 wk</span><span>6 wks</span><span>12 wks</span>
              </div>
            </div>

            {/* Lift % */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Expected Weekly Sales Lift</label>
                <div className="relative w-28">
                  <input
                    type="number" value={liftPct} step={0.5} min={0} max={50}
                    onChange={e => setLiftPct(Math.max(0, Math.min(50, Number(e.target.value) || 0)))}
                    className="w-full rounded-lg py-1.5 px-2 font-mono text-[12px] text-right focus:outline-none pr-7"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(46,232,154,0.25)', color: 'var(--text-primary)' }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: 'var(--text-muted)' }}>%</span>
                </div>
              </div>
              <p className="text-[9px] mb-2" style={{ color: 'var(--text-muted)' }}>
                Industry benchmark for retail social: 3–8% lift per active campaign week
              </p>
              <input type="range" min={0} max={30} step={0.5} value={liftPct}
                onChange={e => setLiftPct(Number(e.target.value))}
                className="w-full"
                style={{ background: `linear-gradient(to right, rgba(46,232,154,0.5) ${liftPct / 30 * 100}%, rgba(255,255,255,0.06) ${liftPct / 30 * 100}%)` }}
              />
              <div className="flex justify-between mt-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                <span>0%</span><span>15%</span><span>30%</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="card p-6 space-y-4" style={{ borderColor: forwardCalc.roi >= 0 ? 'rgba(46,232,154,0.2)' : 'rgba(255,82,82,0.2)' }}>
              <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Projected Results
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Additional Revenue',  value: formatCurrency(forwardCalc.additionalRevenue, true), color: 'var(--accent-green)', bg: 'rgba(46,232,154,0.06)', border: 'rgba(46,232,154,0.14)' },
                  { label: 'Net Gain',             value: formatCurrency(forwardCalc.netGain, true),           color: forwardCalc.netGain >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', bg: forwardCalc.netGain >= 0 ? 'rgba(46,232,154,0.06)' : 'rgba(255,82,82,0.06)', border: forwardCalc.netGain >= 0 ? 'rgba(46,232,154,0.14)' : 'rgba(255,82,82,0.14)' },
                  { label: 'ROI',                  value: `${forwardCalc.roi.toFixed(1)}%`,                   color: forwardCalc.roi >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', bg: forwardCalc.roi >= 0 ? 'rgba(46,232,154,0.06)' : 'rgba(255,82,82,0.06)', border: forwardCalc.roi >= 0 ? 'rgba(46,232,154,0.14)' : 'rgba(255,82,82,0.14)' },
                  { label: 'Return Ratio',         value: `${forwardCalc.roiRatio.toFixed(2)}:1`,             color: 'var(--accent-blue)',  bg: 'rgba(91,173,255,0.06)', border: 'rgba(91,173,255,0.14)' },
                ].map(r => (
                  <div key={r.label} className="rounded-xl p-3.5" style={{ background: r.bg, border: `1px solid ${r.border}` }}>
                    <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{r.label}</p>
                    <p className="font-display font-bold text-[20px] leading-none" style={{ color: r.color }}>{r.value}</p>
                  </div>
                ))}
              </div>

              <div
                className="rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}
              >
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Break-even lift needed</span>
                <span className="font-mono font-bold text-[14px]" style={{ color: 'var(--accent-gold)' }}>
                  {forwardCalc.breakEvenLift.toFixed(1)}%/wk
                </span>
              </div>
            </div>

            <div
              className="card px-4 py-3 text-[11px]"
              style={{ borderColor: 'rgba(232,184,64,0.12)', background: 'rgba(232,184,64,0.04)' }}
            >
              <p className="font-semibold mb-1" style={{ color: 'var(--accent-gold)' }}>Reading this</p>
              <p style={{ color: 'var(--text-muted)' }}>
                Spending {formatCurrency(adSpend)} over {duration} week{duration !== 1 ? 's' : ''} at a {liftPct}% weekly lift
                generates {formatCurrency(forwardCalc.additionalRevenue, true)} in additional revenue.
                You need at least {forwardCalc.breakEvenLift.toFixed(1)}% weekly lift to break even.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Reverse Calculator ───────────────────── */}
      {mode === 'reverse' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Inputs */}
          <div className="card p-6 space-y-5">
            <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Set Your Goal
            </h3>

            {/* Target revenue */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Target Additional Revenue</label>
                <div className="relative w-28">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px]" style={{ color: 'var(--text-muted)' }}>$</span>
                  <input
                    type="number" value={targetRevenue} step={500} min={0}
                    onChange={e => setTargetRevenue(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full rounded-lg py-1.5 pl-6 pr-2 font-mono text-[12px] text-right focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(46,232,154,0.25)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <input type="range" min={0} max={20000} step={500} value={targetRevenue}
                onChange={e => setTargetRevenue(Number(e.target.value))}
                className="w-full"
                style={{ background: `linear-gradient(to right, rgba(46,232,154,0.5) ${targetRevenue / 200}%, rgba(255,255,255,0.06) ${targetRevenue / 200}%)` }}
              />
              <div className="flex justify-between mt-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                <span>$0</span><span>$10k</span><span>$20k</span>
              </div>
            </div>

            {/* Duration */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Campaign Duration</label>
                <div className="relative w-28">
                  <input
                    type="number" value={revDuration} step={1} min={1} max={12}
                    onChange={e => setRevDuration(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
                    className="w-full rounded-lg py-1.5 px-2 font-mono text-[12px] text-right focus:outline-none pr-7"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(91,173,255,0.25)', color: 'var(--text-primary)' }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: 'var(--text-muted)' }}>wk</span>
                </div>
              </div>
              <input type="range" min={1} max={12} step={1} value={revDuration}
                onChange={e => setRevDuration(Number(e.target.value))}
                className="w-full"
                style={{ background: `linear-gradient(to right, rgba(91,173,255,0.5) ${(revDuration - 1) / 11 * 100}%, rgba(255,255,255,0.06) ${(revDuration - 1) / 11 * 100}%)` }}
              />
              <div className="flex justify-between mt-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                <span>1 wk</span><span>6 wks</span><span>12 wks</span>
              </div>
            </div>

            {/* Efficiency assumption */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[11px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Revenue per $ Spent</label>
                <div className="relative w-28">
                  <input
                    type="number" value={efficiency} step={0.5} min={0.5} max={10}
                    onChange={e => setEfficiency(Math.max(0.5, Math.min(10, Number(e.target.value) || 1)))}
                    className="w-full rounded-lg py-1.5 px-2 font-mono text-[12px] text-right focus:outline-none pr-10"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(232,184,64,0.25)', color: 'var(--text-primary)' }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: 'var(--text-muted)' }}>:1</span>
                </div>
              </div>
              <p className="text-[9px] mb-2" style={{ color: 'var(--text-muted)' }}>
                Assumed return ratio — e.g. 3.0 means $1 spent returns $3 in revenue. Retail social benchmark: 2.0–5.0
              </p>
              <input type="range" min={0.5} max={10} step={0.5} value={efficiency}
                onChange={e => setEfficiency(Number(e.target.value))}
                className="w-full"
                style={{ background: `linear-gradient(to right, rgba(232,184,64,0.5) ${(efficiency - 0.5) / 9.5 * 100}%, rgba(255,255,255,0.06) ${(efficiency - 0.5) / 9.5 * 100}%)` }}
              />
              <div className="flex justify-between mt-1 text-[9px]" style={{ color: 'var(--text-muted)' }}>
                <span>0.5:1</span><span>5:1</span><span>10:1</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="card p-6 space-y-4" style={{ borderColor: 'rgba(232,184,64,0.18)' }}>
              <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                What You Need
              </h3>

              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-xl p-4" style={{ background: 'rgba(232,184,64,0.06)', border: '1px solid rgba(232,184,64,0.18)' }}>
                  <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Estimated Budget Needed</p>
                  <p className="font-display font-bold text-[36px] leading-none shimmer-text">{formatCurrency(reverseCalc.requiredSpend, true)}</p>
                  <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>at {efficiency}:1 return ratio over {revDuration} week{revDuration !== 1 ? 's' : ''}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3.5" style={{ background: 'rgba(91,173,255,0.06)', border: '1px solid rgba(91,173,255,0.14)' }}>
                    <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Required Lift / wk</p>
                    <p className="font-display font-bold text-[22px] leading-none" style={{ color: 'var(--accent-blue)' }}>
                      {reverseCalc.requiredLiftPct.toFixed(1)}%
                    </p>
                  </div>
                  <div className="rounded-xl p-3.5" style={{ background: 'rgba(157,120,255,0.06)', border: '1px solid rgba(157,120,255,0.14)' }}>
                    <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Cost per $1 Return</p>
                    <p className="font-display font-bold text-[22px] leading-none" style={{ color: '#9d78ff' }}>
                      ${reverseCalc.costPerDollar.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="card px-4 py-3 text-[11px]"
              style={{ borderColor: 'rgba(232,184,64,0.12)', background: 'rgba(232,184,64,0.04)' }}
            >
              <p className="font-semibold mb-1" style={{ color: 'var(--accent-gold)' }}>Reading this</p>
              <p style={{ color: 'var(--text-muted)' }}>
                To generate {formatCurrency(targetRevenue, true)} in additional revenue over {revDuration} week{revDuration !== 1 ? 's' : ''},
                you need a {reverseCalc.requiredLiftPct.toFixed(1)}% weekly lift.
                At a {efficiency}:1 return ratio, budget approximately {formatCurrency(reverseCalc.requiredSpend, true)}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Scenario Comparison Chart ─────────────── */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Spend Scenarios
          </h3>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            at {liftPct}% lift / {duration} wk · scales linearly with spend
          </span>
        </div>
        <p className="text-[10px] mb-4" style={{ color: 'var(--text-muted)' }}>
          Additional revenue vs. spend at different budget levels. Green = profitable, red = loss.
        </p>

        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scenarioData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <XAxis dataKey="spend" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${v >= 1000 ? Math.round(v / 1000) + 'k' : v}`}
              />
              <Tooltip
                content={({ active, payload }: any) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="card p-3 shadow-2xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}>
                      <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Spend: {formatCurrency(d.spend_raw)}</p>
                      <p className="text-[11px]" style={{ color: 'var(--accent-green)' }}>+Revenue: {formatCurrency(d.addlRev, true)}</p>
                      <p className="text-[11px]" style={{ color: d.net >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>Net: {formatCurrency(d.net, true)}</p>
                    </div>
                  )
                }}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
              <Bar dataKey="addlRev" radius={[4, 4, 0, 0]}>
                {scenarioData.map((entry, i) => (
                  <Cell key={i} fill={entry.positive ? 'rgba(46,232,154,0.7)' : 'rgba(255,82,82,0.7)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-[9px] mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
          Log real campaign data to replace these estimates with your actual performance baseline.
        </p>
      </div>
    </div>
  )
}
