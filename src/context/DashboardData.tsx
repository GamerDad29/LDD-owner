'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { DashboardData } from '@/lib/shopify'

// ── Static fallbacks (used on error or first load) ────────────────────────────
import dailySalesStatic    from '@/data/dailySales.json'
import monthly2024Static   from '@/data/monthly2024.json'
import monthly2025Static   from '@/data/monthly2025.json'
import yoyStatic           from '@/data/yearOverYear.json'
import returns2024Static   from '@/data/returns2024.json'
import returns2025Static   from '@/data/returns2025.json'

const STATIC_FALLBACK = {
  dailySales:   dailySalesStatic   as DashboardData['dailySales'],
  monthly2024:  monthly2024Static  as DashboardData['monthly2024'],
  monthly2025:  monthly2025Static  as DashboardData['monthly2025'],
  monthly2026:  []                 as DashboardData['monthly2026'],
  yearOverYear: yoyStatic          as unknown as DashboardData['yearOverYear'],
  returns2024:  returns2024Static  as DashboardData['returns2024'],
  returns2025:  returns2025Static  as DashboardData['returns2025'],
  returns2026:  []                 as DashboardData['returns2026'],
  lastUpdated:  'static',
}

interface ContextValue {
  data:        DashboardData
  loading:     boolean
  isLive:      boolean
  lastUpdated: string
}

const DashboardDataContext = createContext<ContextValue>({
  data:        STATIC_FALLBACK,
  loading:     true,
  isLive:      false,
  lastUpdated: 'static',
})

const CACHE_KEY      = 'ldd-dashboard-data'
const CACHE_TIME_KEY = 'ldd-dashboard-data-ts'
const CACHE_TTL_MS   = 60 * 60 * 1000 // 1 hour client-side cache

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const [data,        setData]    = useState<DashboardData>(STATIC_FALLBACK)
  const [loading,     setLoading] = useState(true)
  const [isLive,      setIsLive]  = useState(false)
  const [lastUpdated, setLast]    = useState('static')

  useEffect(() => {
    try {
      const cached   = localStorage.getItem(CACHE_KEY)
      const cachedTs = localStorage.getItem(CACHE_TIME_KEY)
      if (cached && cachedTs && Date.now() - parseInt(cachedTs) < CACHE_TTL_MS) {
        const parsed = JSON.parse(cached) as DashboardData
        // Guard: don't use cached data if dailySales is empty — it was a bad fetch
        if (parsed.dailySales?.length > 0) {
          setData(parsed)
          setIsLive(true)
          setLast(parsed.lastUpdated)
          setLoading(false)
          return
        }
        // Bad cache — clear it and fall through to fresh fetch
        localStorage.removeItem(CACHE_KEY)
        localStorage.removeItem(CACHE_TIME_KEY)
      }
    } catch { /* ignore localStorage errors */ }

    fetch('/api/shopify/data')
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then((d: DashboardData) => {
        // Guard: only use live data if it has actual daily sales entries
        if (!d.dailySales?.length) {
          setIsLive(false)
          return
        }
        setData(d)
        setIsLive(true)
        setLast(d.lastUpdated)
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(d))
          localStorage.setItem(CACHE_TIME_KEY, Date.now().toString())
        } catch { /* ignore */ }
      })
      .catch((err) => {
        console.error('Live data fetch failed, using static fallback:', err)
        setIsLive(false)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <DashboardDataContext.Provider value={{ data, loading, isLive, lastUpdated }}>
      {children}
    </DashboardDataContext.Provider>
  )
}

export function useDashboardData() {
  return useContext(DashboardDataContext)
}
