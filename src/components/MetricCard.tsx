'use client'

import { useEffect, useRef, useState } from 'react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: number
  format?: 'currency' | 'number' | 'percent'
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  accentColor?: string
  compact?: boolean
  invertDelta?: boolean
}

function useCountUp(target: number, duration = 750) {
  const [current, setCurrent] = useState(0)
  const rafRef = useRef<number>(0)
  const prevTarget = useRef(0)

  useEffect(() => {
    const from = prevTarget.current
    prevTarget.current = target
    let start: number | null = null
    const animate = (ts: number) => {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setCurrent(from + (target - from) * ease)
      if (p < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return current
}

export default function MetricCard({
  label, value, format = 'currency', change, changeLabel, icon,
  accentColor = 'var(--accent-blue)', compact = false, invertDelta = false,
}: MetricCardProps) {
  const animated = useCountUp(value)

  const fmt = (v: number) => {
    if (format === 'currency') return formatCurrency(v, compact)
    if (format === 'number') return formatNumber(Math.round(v), compact)
    return `${v.toFixed(1)}%`
  }

  const rawPositive = (change ?? 0) >= 0
  // When invertDelta is true, growth is bad (e.g. return rate).
  const good = invertDelta ? !rawPositive : rawPositive

  return (
    <div
      className="metric-card p-5"
      style={{ '--card-accent': accentColor } as React.CSSProperties}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </span>
        {icon && (
          <div
            className="p-2 rounded-lg"
            style={{
              background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
              color: accentColor,
              boxShadow: `0 0 12px color-mix(in srgb, ${accentColor} 12%, transparent)`,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div
        className="font-display font-bold tracking-tight"
        style={{ color: 'var(--text-primary)', fontSize: compact ? '24px' : '28px', lineHeight: 1.1 }}
      >
        {fmt(animated)}
      </div>

      {change !== undefined && (
        <div className="flex items-center gap-1.5 mt-2.5">
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-md"
            style={{
              background: good ? 'rgba(46,232,154,0.1)' : 'rgba(255,82,82,0.1)',
              border: `1px solid ${good ? 'rgba(46,232,154,0.2)' : 'rgba(255,82,82,0.2)'}`,
            }}
          >
            {rawPositive
              ? <TrendingUp size={11} style={{ color: good ? 'var(--accent-green)' : 'var(--accent-red)' }} />
              : <TrendingDown size={11} style={{ color: good ? 'var(--accent-green)' : 'var(--accent-red)' }} />
            }
            <span
              className="text-[11px] font-bold font-mono"
              style={{ color: good ? 'var(--accent-green)' : 'var(--accent-red)' }}
            >
              {rawPositive ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
          {changeLabel && (
            <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{changeLabel}</span>
          )}
        </div>
      )}
    </div>
  )
}
