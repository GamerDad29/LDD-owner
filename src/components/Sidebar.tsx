'use client'

import Image from 'next/image'
import { LayoutDashboard, PieChart, Users, TrendingUp, ChevronLeft, ChevronRight, BarChart3, Megaphone } from 'lucide-react'

export type DashboardView = 'overview' | 'profit-first' | 'team' | 'sales' | 'yoy' | 'social-media'

interface SidebarProps {
  activeView: DashboardView
  onViewChange: (view: DashboardView) => void
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

const navItems: { id: DashboardView; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',     label: 'Overview',       icon: <LayoutDashboard size={18} /> },
  { id: 'profit-first', label: 'Profit First',   icon: <PieChart size={18} /> },
  { id: 'team',         label: 'Team & Payroll', icon: <Users size={18} /> },
  { id: 'sales',        label: 'Sales Insights', icon: <TrendingUp size={18} /> },
  { id: 'yoy',          label: 'Year over Year', icon: <BarChart3 size={18} /> },
  { id: 'social-media', label: 'Ad ROI Planner', icon: <Megaphone size={18} /> },
]

export default function Sidebar({ activeView, onViewChange, collapsed, onCollapsedChange }: SidebarProps) {
  return (
    <aside
      className="fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-300 ease-out"
      style={{
        width: collapsed ? 64 : 228,
        background: 'linear-gradient(180deg, #0c0e1a 0%, #08090f 100%)',
        borderRight: '1px solid rgba(232, 184, 64, 0.09)',
        boxShadow: '4px 0 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Brand header */}
      <div
        className="flex items-center h-16 border-b overflow-hidden"
        style={{
          borderColor: 'oklch(0.78 0.155 80 / 0.10)',
          padding: '0 14px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: collapsed ? 0 : 10,
          background: 'linear-gradient(135deg, oklch(0.78 0.155 80 / 0.07) 0%, transparent 55%)',
        }}
      >
        {/* Logo with pulse ring */}
        <div
          className="flex-shrink-0 rounded-xl overflow-hidden flex items-center justify-center animate-pulse-gold"
          style={{
            width: collapsed ? 34 : 40,
            height: collapsed ? 34 : 40,
            background: 'oklch(0.78 0.155 80 / 0.09)',
            border: '1px solid oklch(0.78 0.155 80 / 0.22)',
            transition: 'all 0.3s ease',
            flexShrink: 0,
          }}
        >
          <Image
            src="https://luckyduckdealz.com/cdn/shop/files/Transparent_Logo_Cropped.png?v=1692552884"
            alt="Lucky Duck Dealz"
            width={collapsed ? 28 : 34}
            height={collapsed ? 28 : 34}
            style={{ objectFit: 'contain', transition: 'all 0.3s ease' }}
            unoptimized
          />
        </div>

        {!collapsed && (
          <div className="animate-fade-in min-w-0">
            <h1
              className="font-display font-bold text-[13px] tracking-tight leading-tight truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              Lucky Duck Dealz
            </h1>
            <p
              className="text-[9px] font-bold tracking-[0.16em] uppercase mt-0.5"
              style={{ color: 'var(--accent-gold)', opacity: 0.75 }}
            >
              Owner Dashboard
            </p>
          </div>
        )}
      </div>

      {/* Nav section label */}
      {!collapsed && (
        <div className="px-4 pt-5 pb-1.5">
          <p className="text-[9px] font-bold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
            Navigation
          </p>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={`sidebar-nav-item w-full flex items-center gap-2.5 text-[13px] font-medium${isActive ? ' active' : ''}`}
              style={{
                padding: collapsed ? '10px' : '9px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: isActive
                  ? 'linear-gradient(90deg, oklch(0.78 0.155 80 / 0.12) 0%, oklch(0.78 0.155 80 / 0.03) 100%)'
                  : 'transparent',
                color: isActive ? 'var(--accent-gold)' : 'var(--text-muted)',
                boxShadow: isActive ? 'inset 0 1px 0 oklch(0.78 0.155 80 / 0.08)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'oklch(1 0 0 / 0.04)'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t" style={{ borderColor: 'rgba(232,184,64,0.08)' }}>
        <button
          onClick={() => onCollapsedChange(!collapsed)}
          className="w-full flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs transition-all duration-200"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(232,184,64,0.06)'
            e.currentTarget.style.color = 'var(--accent-gold)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          {collapsed
            ? <ChevronRight size={14} />
            : <><ChevronLeft size={14} /><span className="font-medium">Collapse</span></>
          }
        </button>
      </div>
    </aside>
  )
}
