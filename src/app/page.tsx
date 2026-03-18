'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar, { DashboardView } from '@/components/Sidebar'
import MetricCard from '@/components/MetricCard'
import NavigationCard from '@/components/NavigationCard'
import GradientMesh from '@/components/GradientMesh'
import NoiseOverlay from '@/components/NoiseOverlay'
import ProfitFirstAllocator from '@/components/ProfitFirstAllocator'
import AdROICalculator from '@/components/AdROICalculator'
import TeamPayroll from '@/components/TeamPayroll'
import SalesInsights from '@/components/SalesInsights'
import YearOverYear from '@/components/YearOverYear'
import { DollarSign, TrendingUp, ShoppingBag, ShoppingCart, PieChart, Users, BarChart3, Megaphone, X } from 'lucide-react'
import payrollData from '@/data/payroll.json'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { useDashboardData } from '@/context/DashboardData'

type CompYear = '2024' | '2025'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
}

export default function Dashboard() {
  const [view, setView] = useState<DashboardView>('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [compYear, setCompYear] = useState<CompYear>('2025')

  const { data: liveData, isLive, loading, lastUpdated, error, dismissError } = useDashboardData()
  const dailySalesData = liveData.dailySales
  const yoyData        = liveData.yearOverYear

  const totSales  = dailySalesData.reduce((s, d) => s + d.totalSales, 0)
  const totOrders = dailySalesData.reduce((s, d) => s + d.orders, 0)
  const avgDaily  = dailySalesData.length > 0 ? totSales / dailySalesData.length : 0
  const avgAOV    = totOrders > 0 ? totSales / totOrders : 0

  const pc = yoyData.periodComparison as any
  const salesGrowthVs25 = pc.salesGrowth ?? 0
  const orderGrowthVs25 = pc.orderGrowth ?? 0
  const salesGrowthVs24 = pc.salesGrowthVs2024 ?? 0
  const orderGrowthVs24 = pc.orderGrowthVs2024 ?? 0

  const comp25 = pc['2025'] as { totalSales: number; totalOrders: number; aov: number }
  const comp24 = pc['2024'] as { totalSales: number; totalOrders: number; aov: number }

  const yoySalesGrowth  = compYear === '2025' ? salesGrowthVs25 : salesGrowthVs24
  const yoyOrderGrowth  = compYear === '2025' ? orderGrowthVs25 : orderGrowthVs24
  const prevTotalSales  = compYear === '2025' ? comp25.totalSales  : comp24.totalSales
  const prevTotalOrders = compYear === '2025' ? comp25.totalOrders : comp24.totalOrders
  const prevAvgDaily    = dailySalesData.length > 0 ? prevTotalSales / dailySalesData.length : 0
  const aovPrevYear     = compYear === '2025' ? comp25.aov : comp24.aov
  const avgDailyChange  = prevAvgDaily > 0 ? ((avgDaily - prevAvgDaily) / prevAvgDaily) * 100 : 0
  const aovChange       = aovPrevYear  > 0 ? ((avgAOV - aovPrevYear)   / aovPrevYear)  * 100 : 0

  const biweeklyPayroll = formatCurrency(payrollData.totals.biweeklyGross)
  const bestDay = dailySalesData.length > 0
    ? formatCurrency(dailySalesData.reduce((b, d) => d.totalSales > b.totalSales ? d : b, dailySalesData[0]).totalSales)
    : '$0'
  const yoyGrowth = `${salesGrowthVs25 >= 0 ? '+' : ''}${salesGrowthVs25.toFixed(1)}%`

  const viewTitles: Record<DashboardView, { title: string; sub: string }> = {
    overview:       { title: 'Owners Space',     sub: 'Your business command center' },
    'profit-first': { title: 'Profit First',     sub: 'Weekly allocation model in real time' },
    team:           { title: 'Team & Payroll',    sub: 'Compensation, distribution, and raise modeling' },
    sales:          { title: 'Sales Insights',    sub: 'Revenue trends, patterns, and product performance' },
    yoy:            { title: 'Year over Year',    sub: '2024 vs 2025 vs 2026 performance comparison' },
    'social-media': { title: 'Social Media',      sub: 'Ad ROI modeling and future social integrations' },
  }

  return (
    <div className="min-h-screen relative">
      {/* WebGL gradient mesh background */}
      <GradientMesh />
      <NoiseOverlay />

      <Sidebar
        activeView={view}
        onViewChange={setView}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      <main
        className="transition-all duration-300 relative z-10"
        style={{ marginLeft: sidebarCollapsed ? 64 : 228, padding: '32px 32px' }}
      >
        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              className="mb-5 px-4 py-3 rounded-xl flex items-center justify-between"
              style={{
                background: 'oklch(0.63 0.17 18 / 0.08)',
                border: '1px solid oklch(0.63 0.17 18 / 0.18)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <p className="text-[12px] font-medium" style={{ color: 'var(--accent-red)' }}>
                Shopify connection failed: {error}
              </p>
              <button onClick={dismissError} className="p-1 rounded-md" style={{ color: 'var(--accent-red)' }}>
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            {view === 'overview' ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  {getGreeting()}, Rebecca
                </p>
                <h2
                  className="font-display font-bold text-[28px] tracking-tight leading-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Owners Space
                </h2>
                <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  Lucky Duck Dealz performance at a glance
                </p>
              </motion.div>
            ) : (
              <div>
                <h2
                  className="font-display font-bold text-[24px] tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {viewTitles[view].title}
                </h2>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {viewTitles[view].sub}
                </p>
              </div>
            )}
            {!loading && (
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mt-2 px-2.5 py-1 rounded-full"
                style={isLive
                  ? {
                      color: 'var(--accent-green)',
                      background: 'oklch(0.75 0.14 155 / 0.08)',
                      border: '1px solid oklch(0.75 0.14 155 / 0.15)',
                      backdropFilter: 'blur(8px)',
                    }
                  : { color: '#ff8a65', background: 'rgba(255,138,101,0.08)', border: '1px solid rgba(255,138,101,0.15)' }
                }
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: isLive ? 'var(--accent-green)' : '#ff8a65' }}
                />
                {isLive
                  ? `Live · ${new Date(lastUpdated).toLocaleDateString()}`
                  : 'Static data'
                }
              </span>
            )}
          </div>

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

        {/* View content with transitions */}
        <AnimatePresence mode="wait">
          {view === 'overview' && (
            <motion.div key="overview" {...pageTransition} className="space-y-6">
              {/* 4 KPI cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger" key={compYear}>
                <MetricCard
                  label="Period Revenue"
                  value={totSales}
                  format="currency"
                  change={yoySalesGrowth}
                  changeLabel={`vs ${formatCurrency(prevTotalSales, true)} in ${compYear}`}
                  icon={<DollarSign size={16} />}
                  accentColor="var(--accent-rose)"
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
                  accentColor="var(--accent-lavender)"
                />
              </div>

              {/* Annualized pace banner — with animated gradient border */}
              <div className="gradient-border">
                <div
                  className="card px-6 py-5 flex items-center justify-between"
                  style={{ borderColor: 'oklch(0.75 0.14 155 / 0.12)' }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="p-3 rounded-xl"
                      style={{
                        background: 'oklch(0.75 0.14 155 / 0.08)',
                        boxShadow: '0 0 20px oklch(0.75 0.14 155 / 0.08)',
                      }}
                    >
                      <TrendingUp size={20} style={{ color: 'var(--accent-green)' }} />
                    </div>
                    <div>
                      <p
                        className="text-[11px] font-bold uppercase tracking-[0.15em]"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        2026 Annualized Pace
                      </p>
                      <p className="font-display font-bold text-[32px] leading-tight shimmer-text">
                        {formatCurrency((yoyData.years['2026'] as any).annualizedSales ?? 0, true)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[12px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                      2025:{' '}
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(yoyData.years['2025'].totalSales, true)}
                      </span>
                    </p>
                    <p className="text-[12px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                      2024:{' '}
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                        {formatCurrency(yoyData.years['2024'].totalSales, true)}
                      </span>
                    </p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      ~{formatNumber(Math.round((yoyData.years['2026'] as any).annualizedOrders ?? 0))} orders/yr
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NavigationCard
                  icon={<PieChart size={18} />}
                  title="Profit First"
                  description="Weekly cash allocation with real-time balance tracking"
                  metric="42.9%"
                  metricLabel="inventory remainder"
                  accentColor="oklch(0.75 0.14 155)"
                  glowColor="oklch(0.68 0.13 290)"
                  view="profit-first"
                  onNavigate={setView}
                  index={0}
                />
                <NavigationCard
                  icon={<Users size={18} />}
                  title="Team & Payroll"
                  description="Roster management, raise simulator, and payroll tracking"
                  metric={biweeklyPayroll}
                  metricLabel="biweekly payroll"
                  accentColor="oklch(0.68 0.13 290)"
                  glowColor="oklch(0.72 0.10 15)"
                  view="team"
                  onNavigate={setView}
                  index={1}
                />
                <NavigationCard
                  icon={<TrendingUp size={18} />}
                  title="Sales Insights"
                  description="Revenue patterns, product performance, and Duck Norris AI"
                  metric={bestDay}
                  metricLabel="best day revenue"
                  accentColor="oklch(0.70 0.14 228)"
                  glowColor="oklch(0.75 0.14 155)"
                  view="sales"
                  onNavigate={setView}
                  index={2}
                />
                <NavigationCard
                  icon={<BarChart3 size={18} />}
                  title="Year over Year"
                  description="2024 vs 2025 vs 2026 apples-to-apples comparison"
                  metric={yoyGrowth}
                  metricLabel="YoY growth"
                  accentColor="oklch(0.76 0.12 55)"
                  glowColor="oklch(0.72 0.10 15)"
                  view="yoy"
                  onNavigate={setView}
                  index={3}
                />
                <NavigationCard
                  icon={<Megaphone size={18} />}
                  title="Social Media"
                  description="Ad ROI planner and future social media integrations"
                  accentColor="oklch(0.72 0.10 15)"
                  glowColor="oklch(0.68 0.13 290)"
                  view="social-media"
                  onNavigate={setView}
                  index={4}
                />
              </div>
            </motion.div>
          )}

          {view === 'profit-first' && (
            <motion.div key="profit-first" {...pageTransition}><ProfitFirstAllocator /></motion.div>
          )}
          {view === 'team' && (
            <motion.div key="team" {...pageTransition}><TeamPayroll /></motion.div>
          )}
          {view === 'sales' && (
            <motion.div key="sales" {...pageTransition}><SalesInsights /></motion.div>
          )}
          {view === 'yoy' && (
            <motion.div key="yoy" {...pageTransition}><YearOverYear /></motion.div>
          )}
          {view === 'social-media' && (
            <motion.div key="social-media" {...pageTransition}><AdROICalculator /></motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
