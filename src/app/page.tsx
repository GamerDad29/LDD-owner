'use client'

import { useState } from 'react'
import Sidebar, { DashboardView } from '@/components/Sidebar'
import MetricCard from '@/components/MetricCard'
import SalesChart from '@/components/SalesChart'
import RevenueBreakdown from '@/components/RevenueBreakdown'
import ProfitFirstAllocator from '@/components/ProfitFirstAllocator'
import TeamPayroll from '@/components/TeamPayroll'
import SalesInsights from '@/components/SalesInsights'
import YearOverYear from '@/components/YearOverYear'
import { DollarSign, TrendingUp, ShoppingBag, ShoppingCart } from 'lucide-react'
import dailySalesData from '@/data/dailySales.json'
import payrollData from '@/data/payroll.json'
import yoyData from '@/data/yearOverYear.json'
import { formatCurrency, formatNumber } from '@/lib/utils'

type CompYear = '2024' | '2025'

export default function Dashboard() {
  const [view, setView] = useState<DashboardView>('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [compYear, setCompYear] = useState<CompYear>('2025')

  const totSales = dailySalesData.reduce((s: number, d: any) => s + d.totalSales, 0)
  const totOrders = dailySalesData.reduce((s: number, d: any) => s + d.orders, 0)
  const avgDaily = totSales / dailySalesData.length
  const avgAOV = totSales / totOrders

  // YoY comparisons
  const salesGrowthVs25 = yoyData.periodComparison.salesGrowth
  const orderGrowthVs25 = yoyData.periodComparison.orderGrowth
  const salesGrowthVs24 = (yoyData.periodComparison as any).salesGrowthVs2024 as number
  const orderGrowthVs24 = (yoyData.periodComparison as any).orderGrowthVs2024 as number

  const comp25 = yoyData.periodComparison['2025']
  const comp24 = (yoyData.periodComparison as any)['2024'] as { totalSales: number; totalOrders: number; aov: number }

  const yoySalesGrowth  = compYear === '2025' ? salesGrowthVs25 : salesGrowthVs24
  const yoyOrderGrowth  = compYear === '2025' ? orderGrowthVs25 : orderGrowthVs24
  const prevTotalSales  = compYear === '2025' ? comp25.totalSales : comp24.totalSales
  const prevTotalOrders = compYear === '2025' ? comp25.totalOrders : comp24.totalOrders
  const prevAvgDaily    = prevTotalSales / dailySalesData.length
  const aovPrevYear     = compYear === '2025' ? comp25.aov : comp24.aov
  const avgDailyChange  = ((avgDaily - prevAvgDaily) / prevAvgDaily) * 100
  const aovChange       = ((avgAOV - aovPrevYear) / aovPrevYear) * 100

  const viewTitles: Record<DashboardView, { title: string; sub: string }> = {
    overview:     { title: 'Dashboard',       sub: 'Lucky Duck Dealz performance at a glance' },
    'profit-first': { title: 'Profit First',  sub: 'Weekly allocation model in real time' },
    team:         { title: 'Team & Payroll',   sub: 'Compensation, distribution, and raise modeling' },
    sales:        { title: 'Sales Insights',   sub: 'Revenue trends, patterns, and product performance' },
    yoy:          { title: 'Year over Year',   sub: '2024 vs 2025 vs 2026 performance comparison' },
  }

  return (
    <div className="min-h-screen">
      <Sidebar
        activeView={view}
        onViewChange={setView}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <main
        className="transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 64 : 228, padding: '32px 28px' }}
      >
        {/* Page header */}
        <div className="mb-7 flex items-center justify-between">
          <div>
            <h2
              className="font-display font-bold text-[22px] tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {viewTitles[view].title}
            </h2>
            <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {viewTitles[view].sub}
            </p>
          </div>

          {/* Year comparison toggle — only on overview */}
          {view === 'overview' && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                Compare vs
              </span>
              <div className="toggle-group">
                {(['2024', '2025'] as CompYear[]).map(y => (
                  <button
                    key={y}
                    onClick={() => setCompYear(y)}
                    className={`toggle-btn ${compYear === y ? 'active' : ''}`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {view === 'overview' && (
          <div className="space-y-5">
            {/* 4 KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger" key={compYear}>
              <MetricCard
                label="Period Revenue"
                value={totSales}
                format="currency"
                change={yoySalesGrowth}
                changeLabel={`vs ${formatCurrency(prevTotalSales, true)} in ${compYear}`}
                icon={<DollarSign size={16} />}
                accentColor="var(--accent-gold)"
                compact
              />
              <MetricCard
                label="Total Orders"
                value={totOrders}
                format="number"
                change={yoyOrderGrowth}
                changeLabel={`vs ${formatNumber(prevTotalOrders)} in ${compYear}`}
                icon={<ShoppingCart size={16} />}
                accentColor="var(--accent-blue)"
              />
              <MetricCard
                label="Avg Daily Revenue"
                value={avgDaily}
                format="currency"
                change={avgDailyChange}
                changeLabel={`vs ${formatCurrency(prevAvgDaily)} in ${compYear}`}
                icon={<TrendingUp size={16} />}
                accentColor="var(--accent-green)"
              />
              <MetricCard
                label="Avg Order Value"
                value={avgAOV}
                format="currency"
                change={aovChange}
                changeLabel={`vs ${formatCurrency(aovPrevYear)} in ${compYear}`}
                icon={<ShoppingBag size={16} />}
                accentColor="var(--accent-purple)"
              />
            </div>

            {/* Annualized pace banner */}
            <div
              className="card px-5 py-4 flex items-center justify-between"
              style={{ borderColor: 'rgba(46,232,154,0.14)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-xl"
                  style={{ background: 'rgba(46,232,154,0.1)', boxShadow: '0 0 16px rgba(46,232,154,0.1)' }}
                >
                  <TrendingUp size={17} style={{ color: 'var(--accent-green)' }} />
                </div>
                <div>
                  <p
                    className="text-[11px] font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    2026 Annualized Pace
                  </p>
                  <p
                    className="font-display font-bold text-[26px] leading-tight shimmer-text"
                  >
                    {formatCurrency(yoyData.years['2026'].annualizedSales, true)}
                  </p>
                </div>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-[12px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                  2025 Full Year:{' '}
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(yoyData.years['2025'].totalSales, true)}
                  </span>
                </p>
                <p className="text-[12px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                  2024 Full Year:{' '}
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                    {formatCurrency(yoyData.years['2024'].totalSales, true)}
                  </span>
                </p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  Orders pace: ~{formatNumber(Math.round(yoyData.years['2026'].annualizedOrders))}/yr
                </p>
              </div>
            </div>

            <SalesChart />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <RevenueBreakdown />

              {/* Payroll snapshot */}
              <div className="card p-6">
                <h3
                  className="font-display font-bold text-[17px]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Payroll Snapshot
                </h3>
                <p className="text-[11px] mt-0.5 mb-4" style={{ color: 'var(--text-muted)' }}>
                  Most recent pay period
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div
                    className="rounded-xl p-3"
                    style={{ background: 'rgba(232,184,64,0.06)', border: '1px solid rgba(232,184,64,0.12)' }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                      Biweekly
                    </p>
                    <p
                      className="font-display font-bold text-[20px]"
                      style={{ color: 'var(--accent-gold)' }}
                    >
                      {formatCurrency(payrollData.totals.biweeklyGross)}
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-3"
                    style={{ background: 'rgba(91,173,255,0.06)', border: '1px solid rgba(91,173,255,0.12)' }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                      Est. Monthly
                    </p>
                    <p
                      className="font-display font-bold text-[20px]"
                      style={{ color: 'var(--accent-blue)' }}
                    >
                      {formatCurrency(payrollData.totals.estimatedMonthly)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {payrollData.employees
                    .filter((e: any) => !e.isOwner)
                    .sort((a: any, b: any) => b.biweeklyPay - a.biweeklyPay)
                    .slice(0, 8)
                    .map((emp: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5 px-2 rounded-lg transition-all"
                        style={{ borderBottom: '1px solid var(--border-subtle)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                            style={{ background: 'rgba(232,184,64,0.1)', color: 'var(--accent-gold)' }}
                          >
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {emp.name}
                            </p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{emp.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[12px] font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {formatCurrency(emp.biweeklyPay)}
                          </span>
                          {emp.hourlyRate && (
                            <span className="text-[10px] font-mono ml-2" style={{ color: 'var(--accent-amber)' }}>
                              ${emp.hourlyRate}/hr
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  <button
                    onClick={() => setView('team')}
                    className="w-full text-center text-[11px] py-2.5 mt-2 font-bold rounded-lg transition-all"
                    style={{ color: 'var(--accent-gold)', background: 'rgba(232,184,64,0.06)', border: '1px solid rgba(232,184,64,0.12)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,184,64,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,184,64,0.06)' }}
                  >
                    View all {payrollData.employees.length} team members →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'profit-first' && <ProfitFirstAllocator />}
        {view === 'team' && <TeamPayroll />}
        {view === 'sales' && <SalesInsights />}
        {view === 'yoy' && <YearOverYear />}
      </main>
    </div>
  )
}
