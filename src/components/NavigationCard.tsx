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
  glowColor: string
  view: DashboardView
  onNavigate: (view: DashboardView) => void
  index: number
}

export default function NavigationCard({
  icon, title, description, metric, metricLabel,
  accentColor, glowColor, view, onNavigate, index,
}: NavigationCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 28, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: 0.15 + index * 0.08,
        type: 'spring',
        stiffness: 200,
        damping: 22,
      }}
      whileHover={{
        y: -4,
        scale: 1.015,
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onNavigate(view)}
      className="relative text-left w-full group cursor-pointer overflow-hidden"
      style={{ borderRadius: 'var(--radius-lg)' }}
    >
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          padding: '1px',
          background: `conic-gradient(from 0deg, ${accentColor}66, ${glowColor}33, transparent, ${accentColor}33, ${glowColor}66)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          animation: 'borderRotate 4s linear infinite',
        }}
      />

      {/* Glow bloom on hover */}
      <div
        className="absolute -inset-1 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{ background: `${accentColor}12` }}
      />

      {/* Card body */}
      <div
        className="relative rounded-[inherit] p-5 h-full"
        style={{
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(24px) saturate(1.3)',
          WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
          border: `1px solid oklch(1 0 0 / 0.07)`,
          boxShadow: 'var(--shadow-sm), inset 0 1px 0 oklch(1 0 0 / 0.04)',
        }}
      >
        {/* Top accent gradient line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[inherit]"
          style={{
            background: `linear-gradient(90deg, ${accentColor}80, ${glowColor}40, transparent)`,
          }}
        />

        {/* Corner glow */}
        <div
          className="absolute top-0 right-0 w-32 h-32 opacity-[0.04] group-hover:opacity-[0.10] transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle at top right, ${accentColor}, transparent 70%)`,
          }}
        />

        <div className="flex items-start justify-between mb-3.5 relative z-10">
          <div
            className="p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
            style={{
              background: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
              boxShadow: `0 0 0 1px color-mix(in srgb, ${accentColor} 12%, transparent)`,
            }}
          >
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
          {metric && (
            <div className="text-right">
              <p
                className="font-display font-bold text-[20px] leading-none tracking-tight"
                style={{ color: accentColor }}
              >
                {metric}
              </p>
              {metricLabel && (
                <p className="text-[9px] mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>
                  {metricLabel}
                </p>
              )}
            </div>
          )}
        </div>
        <h3
          className="font-display font-bold text-[15px] mb-1 relative z-10"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h3>
        <p className="text-[11px] leading-relaxed relative z-10" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>

        {/* Bottom arrow indicator */}
        <div
          className="absolute bottom-4 right-5 opacity-0 group-hover:opacity-60 translate-x-[-4px] group-hover:translate-x-0 transition-all duration-300"
          style={{ color: accentColor }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </motion.button>
  )
}
