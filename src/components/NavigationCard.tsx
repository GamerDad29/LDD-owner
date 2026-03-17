'use client'

import { motion } from 'framer-motion'
import { DashboardView } from '@/components/Sidebar'

interface NavigationCardProps {
  icon: React.ReactNode
  title: string
  description: string
  metric?: string
  metricLabel?: string
  accentColor: string
  view: DashboardView
  onNavigate: (view: DashboardView) => void
  index: number
}

export default function NavigationCard({
  icon, title, description, metric, metricLabel,
  accentColor, view, onNavigate, index,
}: NavigationCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.06,
        type: 'spring',
        stiffness: 260,
        damping: 24,
      }}
      onClick={() => onNavigate(view)}
      className="card p-5 text-left w-full group"
      style={{
        borderLeft: `3px solid ${accentColor}50`,
        cursor: 'pointer',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="p-2.5 rounded-xl transition-all duration-200 group-hover:scale-110"
          style={{
            background: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
            boxShadow: `0 0 12px color-mix(in srgb, ${accentColor} 8%, transparent)`,
          }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        {metric && (
          <div className="text-right">
            <p
              className="font-display font-bold text-[18px] leading-none"
              style={{ color: accentColor }}
            >
              {metric}
            </p>
            {metricLabel && (
              <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {metricLabel}
              </p>
            )}
          </div>
        )}
      </div>
      <h3
        className="font-display font-bold text-[15px] mb-1"
        style={{ color: 'var(--text-primary)' }}
      >
        {title}
      </h3>
      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>
    </motion.button>
  )
}
