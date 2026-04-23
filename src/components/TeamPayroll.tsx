'use client'

import { useState, useMemo } from 'react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Users, DollarSign, TrendingUp, Calculator, RotateCcw } from 'lucide-react'
import payrollData from '@/data/payroll.json'
import dailySalesData from '@/data/dailySales.json'

interface EmpState {
  name: string
  role: string
  biweeklyPay: number
  hourlyRate: number | null
  estHours: number | null
  isOwner: boolean
  raise: number
}

const ROLE_COLORS: Record<string, string> = {
  Owner: '#f5a623',
  'Warehouse Manager': '#a07dfc',
  'Merchandise Manager': '#4d9fff',
  'Customer Service Manager': '#3dd68c',
  'Merchandise Lead': '#4d9fff',
  Merchandise: '#4d9fff',
  Register: '#3dd68c',
  'Register / Merchandise': '#3dd68c',
  Warehouse: '#a07dfc',
  Apparel: '#e87da0',
  Staff: '#a0a3b1',
  'Sunday Staff': '#4dd4e6',
  'Part-Time': '#4dd4e6',
}

export default function TeamPayroll() {
  const [employees, setEmployees] = useState<EmpState[]>(
    payrollData.employees.map(e => ({ ...e, raise: 0 }))
  )
  const [globalRaise, setGlobalRaise] = useState(0)
  const [showSim, setShowSim] = useState(false)

  // Correct monthly revenue: daily avg * 30.44
  const totalSales = dailySalesData.reduce((s: number, d: any) => s + d.totalSales, 0)
  const dailyAvg = totalSales / dailySalesData.length
  const monthlyRev = dailyAvg * 30.44

  const baseMo = payrollData.totals.estimatedMonthly
  const staff = employees.filter(e => !e.isOwner)

  const currentMo = useMemo(() => {
    const base = employees.reduce((s, e) => s + e.biweeklyPay, 0)
    const raises = staff.reduce((s, e) => s + e.raise, 0)
    const global = staff.length * globalRaise
    return (base + raises + global) * 2
  }, [employees, globalRaise, staff.length])

  const delta = currentMo - baseMo
  const pctRev = (currentMo / monthlyRev) * 100

  const resetAll = () => {
    setEmployees(prev => prev.map(e => ({ ...e, raise: 0 })))
    setGlobalRaise(0)
  }

  const sortedStaff = [...staff].sort((a, b) => (b.biweeklyPay + b.raise) - (a.biweeklyPay + a.raise))
  const owner = employees.find(e => e.isOwner)

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(77,159,255,0.1)' }}><Users size={15} style={{ color: 'var(--accent-blue)' }} /></div>
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Team Size</span>
          </div>
          <div className="font-display font-bold text-[26px]" style={{ color: 'var(--text-primary)' }}>{employees.length}</div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{staff.length} staff + 1 owner</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(245,166,35,0.1)' }}><DollarSign size={15} style={{ color: 'var(--accent-peach)' }} /></div>
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Monthly Payroll</span>
          </div>
          <div className="font-display font-bold text-[26px]" style={{ color: 'var(--text-primary)' }}>{formatCurrency(currentMo)}</div>
          {delta !== 0 && (
            <p className="text-[11px] mt-1 font-semibold" style={{ color: delta > 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
              {delta > 0 ? '+' : ''}{formatCurrency(delta)} from base
            </p>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(160,125,252,0.1)' }}><TrendingUp size={15} style={{ color: 'var(--accent-lavender)' }} /></div>
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>% of Revenue</span>
          </div>
          <div className="font-display font-bold text-[26px]" style={{ color: pctRev > 30 ? 'var(--accent-red)' : pctRev > 25 ? 'var(--accent-peach)' : 'var(--accent-green)' }}>
            {pctRev.toFixed(1)}%
          </div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Target: 25% | Rev: {formatCurrency(monthlyRev)}/mo</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(61,214,140,0.1)' }}><Calculator size={15} style={{ color: 'var(--accent-green)' }} /></div>
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Annual Payroll</span>
          </div>
          <div className="font-display font-bold text-[26px]" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(currentMo * 12, true)}
          </div>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Based on current period</p>
        </div>
      </div>

      {/* Owner callout */}
      {owner && (
        <div className="card px-5 py-3 flex items-center justify-between" style={{ borderColor: 'rgba(245,166,35,0.12)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold" style={{ background: 'rgba(245,166,35,0.12)', color: 'var(--accent-peach)' }}>R</div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{owner.name}</p>
              <p className="text-[11px]" style={{ color: 'var(--accent-peach)' }}>Owner</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(owner.biweeklyPay)}<span className="text-[11px] font-normal" style={{ color: 'var(--text-muted)' }}>/bw</span></p>
            <p className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>{formatCurrency(owner.biweeklyPay * 2)}/mo</p>
          </div>
        </div>
      )}

      {/* Team table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-display font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>Team Roster</h3>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {staff.length} staff members | Hourly rates are estimates (adjust to actual)
            </p>
          </div>
          <button
            onClick={() => setShowSim(!showSim)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-semibold transition-all"
            style={{
              background: showSim ? 'rgba(77,159,255,0.12)' : 'rgba(255,255,255,0.04)',
              color: showSim ? 'var(--accent-blue)' : 'var(--text-muted)',
              border: showSim ? '1px solid rgba(77,159,255,0.15)' : '1px solid transparent',
            }}
          >
            <Calculator size={13} />
            {showSim ? 'Hide Simulator' : 'Raise Simulator'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th className="text-left py-3 px-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Employee</th>
                <th className="text-left py-3 px-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Role</th>
                <th className="text-right py-3 px-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>$/Hour</th>
                <th className="text-right py-3 px-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Est. Hrs/BW</th>
                <th className="text-right py-3 px-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Biweekly</th>
                <th className="text-right py-3 px-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Monthly</th>
                {showSim && <th className="text-right py-3 px-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--accent-blue)' }}>Raise</th>}
              </tr>
            </thead>
            <tbody>
              {sortedStaff.map((emp, i) => {
                const totalRaise = emp.raise + globalRaise
                const newBw = emp.biweeklyPay + totalRaise
                const newMo = newBw * 2
                const roleColor = ROLE_COLORS[emp.role] || '#a0a3b1'
                return (
                  <tr
                    key={emp.name}
                    className="transition-colors"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      background: totalRaise > 0 ? 'rgba(61,214,140,0.03)' : 'transparent',
                    }}
                    onMouseEnter={e => { if (totalRaise === 0) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                    onMouseLeave={e => { if (totalRaise === 0) e.currentTarget.style.background = 'transparent' }}
                  >
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                          style={{ background: `${roleColor}18`, color: roleColor }}
                        >
                          {emp.name.charAt(0)}
                        </div>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{emp.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className="text-[11px] px-2 py-0.5 rounded" style={{ color: roleColor, background: `${roleColor}12` }}>{emp.role}</span>
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono" style={{ color: 'var(--accent-peach)' }}>
                      {emp.hourlyRate ? `$${emp.hourlyRate.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono" style={{ color: 'var(--text-muted)' }}>
                      {emp.estHours || '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono" style={{ color: 'var(--text-primary)' }}>
                      {formatCurrency(newBw)}
                      {totalRaise > 0 && <span className="text-[10px] ml-1" style={{ color: 'var(--accent-green)' }}>+{formatCurrency(totalRaise)}</span>}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {formatCurrency(newMo)}
                    </td>
                    {showSim && (
                      <td className="py-2.5 px-2 text-right" style={{ minWidth: 120 }}>
                        <input
                          type="range" min={0} max={150} step={5}
                          value={emp.raise}
                          onChange={e => setEmployees(prev => prev.map(x => x.name === emp.name ? { ...x, raise: Number(e.target.value) } : x))}
                          className="w-20"
                        />
                        <span className="text-[10px] font-mono ml-1.5" style={{ color: emp.raise > 0 ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                          {emp.raise > 0 ? `+$${emp.raise}` : '$0'}
                        </span>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '1px solid var(--border-subtle)' }}>
                <td colSpan={4} className="py-3 px-2 text-[12px] font-semibold" style={{ color: 'var(--text-secondary)' }}>Staff Total ({staff.length})</td>
                <td className="py-3 px-2 text-right font-mono font-bold text-[13px]" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(sortedStaff.reduce((s, e) => s + e.biweeklyPay + e.raise + globalRaise, 0))}
                </td>
                <td className="py-3 px-2 text-right font-mono font-bold text-[13px]" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(sortedStaff.reduce((s, e) => s + e.biweeklyPay + e.raise + globalRaise, 0) * 2)}
                </td>
                {showSim && <td></td>}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Raise Simulator panel */}
      {showSim && (
        <div className="card p-6" style={{ borderColor: 'rgba(77,159,255,0.1)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-[17px]" style={{ color: 'var(--text-primary)' }}>Raise Simulator</h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Use sliders in the table above for individual raises, or set a team-wide raise below</p>
            </div>
            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
              style={{ color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)' }}
            >
              <RotateCcw size={12} /> Reset All
            </button>
          </div>

          <div className="rounded-lg p-4 mb-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Team-Wide Raise</span>
              <span className="text-[13px] font-mono font-bold" style={{ color: 'var(--accent-blue)' }}>
                {globalRaise > 0 ? `+${formatCurrency(globalRaise)}/bw each` : 'None'}
              </span>
            </div>
            <input type="range" min={0} max={200} step={5} value={globalRaise} onChange={e => setGlobalRaise(Number(e.target.value))} className="w-full" />
            <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
              <span>$0</span><span>$100</span><span>$200</span>
            </div>
            {globalRaise > 0 && (
              <div className="flex gap-6 mt-3 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                <span>Monthly cost: <span className="font-mono font-semibold" style={{ color: 'var(--accent-red)' }}>{formatCurrency(globalRaise * staff.length * 2)}</span></span>
                <span>Annual: <span className="font-mono font-semibold" style={{ color: 'var(--accent-red)' }}>{formatCurrency(globalRaise * staff.length * 26)}</span></span>
              </div>
            )}
          </div>

          {/* Impact summary */}
          {delta > 0 && (
            <div className="rounded-lg p-4" style={{ background: 'rgba(240,96,96,0.05)', border: '1px solid rgba(240,96,96,0.1)' }}>
              <h4 className="text-[13px] font-semibold mb-3" style={{ color: 'var(--accent-red)' }}>Impact Summary</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
                <div>
                  <p style={{ color: 'var(--text-muted)' }}>+ Monthly</p>
                  <p className="font-mono font-bold text-[14px]" style={{ color: 'var(--accent-red)' }}>{formatCurrency(delta)}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)' }}>+ Annual</p>
                  <p className="font-mono font-bold text-[14px]" style={{ color: 'var(--accent-red)' }}>{formatCurrency(delta * 12)}</p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)' }}>New Payroll % of Rev</p>
                  <p className="font-mono font-bold text-[14px]" style={{ color: pctRev > 30 ? 'var(--accent-red)' : 'var(--accent-peach)' }}>
                    {pctRev.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p style={{ color: 'var(--text-muted)' }}>Was</p>
                  <p className="font-mono font-bold text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                    {(baseMo / monthlyRev * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
