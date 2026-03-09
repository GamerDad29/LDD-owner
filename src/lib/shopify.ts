import { unstable_cache } from 'next/cache'

const API_URL = `https://${process.env.SHOPIFY_STORE}/admin/api/2026-01/graphql.json`

type ShopifyRow = Record<string, string | null>

async function shopifyQL(qlQuery: string): Promise<ShopifyRow[]> {
  const escaped = qlQuery.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN!,
    },
    body: JSON.stringify({
      query: `{ shopifyqlQuery(query: "${escaped}") { tableData { columns { name } rows } parseErrors } }`,
    }),
  })
  const data = await res.json()
  const result = data.data?.shopifyqlQuery
  if (result?.parseErrors?.length) console.error('ShopifyQL error:', result.parseErrors)
  return result?.tableData?.rows ?? []
}

const num = (v: string | null | undefined) => parseFloat(v ?? '0') || 0

async function _fetchDashboardData() {
  const today = new Date()
  const currentYear = today.getFullYear()

  const [daily, m2024, m2025, m2026] = await Promise.all([
    shopifyQL(`FROM sales SHOW gross_sales, net_sales, total_sales, orders, discounts, returns, taxes GROUP BY day SINCE ${currentYear}-01-01 ORDER BY day`),
    shopifyQL('FROM sales SHOW total_sales, orders, gross_sales, net_sales, discounts, returns, taxes GROUP BY month SINCE 2024-01-01 UNTIL 2024-12-31 ORDER BY month'),
    shopifyQL('FROM sales SHOW total_sales, orders, gross_sales, net_sales, discounts, returns, taxes GROUP BY month SINCE 2025-01-01 UNTIL 2025-12-31 ORDER BY month'),
    shopifyQL(`FROM sales SHOW total_sales, orders, gross_sales, net_sales, discounts, returns, taxes GROUP BY month SINCE ${currentYear}-01-01 ORDER BY month`),
  ])

  // ── Daily Sales ──────────────────────────────────────────────────────────────
  const dailySales = daily.map(r => ({
    date:       r.day ?? '',
    orders:     num(r.orders),
    grossSales: num(r.gross_sales),
    discounts:  num(r.discounts),
    returns:    num(r.returns),
    netSales:   num(r.net_sales),
    taxes:      num(r.taxes),
    totalSales: num(r.total_sales),
  }))

  // ── Monthly lookup maps ──────────────────────────────────────────────────────
  const map2024: Record<string, ShopifyRow> = {}
  for (const r of m2024) { if (r.month) map2024[r.month.slice(0, 7)] = r }

  const map2025: Record<string, ShopifyRow> = {}
  for (const r of m2025) { if (r.month) map2025[r.month.slice(0, 7)] = r }

  const buildMonthly = (rows: ShopifyRow[], prevMap: Record<string, ShopifyRow>, prevPrefix: string) =>
    rows.map(r => {
      const key   = r.month?.slice(0, 7) ?? ''
      const ts    = num(r.total_sales)
      const ord   = num(r.orders)
      const pKey  = prevPrefix + key.slice(5)
      const prev  = prevMap[pKey]
      const prevTs  = num(prev?.total_sales)
      const prevOrd = num(prev?.orders)
      return {
        month:               key,
        totalSales:          ts,
        orders:              ord,
        grossSales:          num(r.gross_sales),
        discounts:           num(r.discounts),
        returns:             num(r.returns),
        netSales:            num(r.net_sales),
        taxes:               num(r.taxes),
        aov:                 ord > 0 ? Math.round((ts / ord) * 1000) / 1000 : 0,
        prevYearTotalSales:  prevTs,
        prevYearOrders:      prevOrd,
        yoyChange:           prevTs > 0 ? Math.round(((ts - prevTs) / prevTs) * 10000) / 100 : 0,
      }
    })

  const monthly2024 = buildMonthly(m2024, {}, '')
  const monthly2025 = buildMonthly(m2025, map2024, '2024-')
  const monthly2026 = buildMonthly(m2026, map2025, '2025-')

  // ── Returns (monthly) ────────────────────────────────────────────────────────
  const returns2024 = monthly2024.map(m => ({
    month:           m.month,
    returns:         m.returns,
    prevYearReturns: 0,
  }))
  const returns2025 = monthly2025.map(m => ({
    month:           m.month,
    returns:         m.returns,
    prevYearReturns: num(map2024['2024-' + m.month.slice(5)]?.returns),
  }))
  const returns2026 = monthly2026.map(m => ({
    month:           m.month,
    returns:         m.returns,
    prevYearReturns: num(map2025['2025-' + m.month.slice(5)]?.returns),
  }))

  // ── Year aggregates ──────────────────────────────────────────────────────────
  const sumYear = (months: typeof monthly2024) => {
    const ts  = months.reduce((s, m) => s + m.totalSales, 0)
    const ord = months.reduce((s, m) => s + m.orders, 0)
    const ret = months.reduce((s, m) => s + m.returns, 0)
    return { totalSales: ts, totalOrders: ord, returns: ret,
      aov:        ord > 0 ? ts / ord : 0,
      monthlyAvg: months.length > 0 ? ts / 12 : 0,
      returnRate: ts > 0 ? Math.abs(ret) / ts * 100 : 0,
    }
  }

  const y2024 = sumYear(monthly2024)
  const y2025 = sumYear(monthly2025)

  const periodDays = dailySales.length
  const ytdTs  = dailySales.reduce((s, d) => s + d.totalSales, 0)
  const ytdOrd = dailySales.reduce((s, d) => s + d.orders, 0)
  const ytdRet = dailySales.reduce((s, d) => s + d.returns, 0)
  const dailyAvg = periodDays > 0 ? ytdTs / periodDays : 0

  // ── Period comparison (same calendar window across years) ────────────────────
  const lastDate    = dailySales.length > 0 ? dailySales[dailySales.length - 1].date : ''
  const lastMonthYr = lastDate.slice(0, 7)
  const sameMo2025  = '2025-' + lastMonthYr.slice(5)
  const sameMo2024  = '2024-' + lastMonthYr.slice(5)

  const periodSum = (months: typeof monthly2024, upTo: string) =>
    months.filter(m => m.month <= upTo)
      .reduce((a, m) => ({ ts: a.ts + m.totalSales, ord: a.ord + m.orders }),
              { ts: 0, ord: 0 })

  const p2025 = periodSum(monthly2025, sameMo2025)
  const p2024 = periodSum(monthly2024, sameMo2024)

  const yoyVs2025SP = p2025.ts > 0 ? ((ytdTs - p2025.ts) / p2025.ts) * 100 : 0
  const yoyVs2025F  = y2025.totalSales > 0 ? ((ytdTs - y2025.totalSales) / y2025.totalSales) * 100 : 0
  const salesGrowth     = p2025.ts  > 0 ? ((ytdTs  - p2025.ts)  / p2025.ts)  * 100 : 0
  const orderGrowth     = p2025.ord > 0 ? ((ytdOrd - p2025.ord) / p2025.ord) * 100 : 0
  const salesGrowthVs24 = p2024.ts  > 0 ? ((ytdTs  - p2024.ts)  / p2024.ts)  * 100 : 0
  const orderGrowthVs24 = p2024.ord > 0 ? ((ytdOrd - p2024.ord) / p2024.ord) * 100 : 0

  const periodLabel = lastDate
    ? `Jan 1 - ${new Date(lastDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : 'YTD'

  const yearOverYear = {
    years: {
      '2024': { ...y2024 },
      '2025': { ...y2025, yoyVs2024: y2024.totalSales > 0 ? ((y2025.totalSales - y2024.totalSales) / y2024.totalSales) * 100 : 0 },
      '2026': {
        periodDays,
        totalSales:       ytdTs,
        totalOrders:      ytdOrd,
        aov:              ytdOrd > 0 ? ytdTs / ytdOrd : 0,
        dailyAvg,
        returns:          ytdRet,
        returnRate:       ytdTs > 0 ? Math.abs(ytdRet) / ytdTs * 100 : 0,
        annualizedSales:  dailyAvg * 365,
        annualizedOrders: periodDays > 0 ? (ytdOrd / periodDays) * 365 : 0,
        yoyVs2025SamePeriod: yoyVs2025SP,
        yoyVs2025Full:       yoyVs2025F,
      },
    },
    periodComparison: {
      label: periodLabel,
      '2024': { totalSales: p2024.ts, totalOrders: p2024.ord, aov: p2024.ord > 0 ? p2024.ts / p2024.ord : 0 },
      '2025': { totalSales: p2025.ts, totalOrders: p2025.ord, aov: p2025.ord > 0 ? p2025.ts / p2025.ord : 0 },
      '2026': { totalSales: ytdTs,    totalOrders: ytdOrd,    aov: ytdOrd > 0 ? ytdTs / ytdOrd : 0 },
      salesGrowth,
      orderGrowth,
      salesGrowthVs2024: salesGrowthVs24,
      orderGrowthVs2024: orderGrowthVs24,
    },
  }

  return {
    dailySales,
    monthly2024,
    monthly2025,
    monthly2026,
    yearOverYear,
    returns2024,
    returns2025,
    returns2026,
    lastUpdated: new Date().toISOString(),
  }
}

export const fetchDashboardData = unstable_cache(
  _fetchDashboardData,
  ['shopify-dashboard'],
  { revalidate: 86400, tags: ['shopify-data'] },
)

export type DashboardData = Awaited<ReturnType<typeof _fetchDashboardData>>
