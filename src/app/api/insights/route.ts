import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM = `You are Duck Norris, a sharp and no-nonsense business intelligence assistant for Lucky Duck Dealz, a high-volume retail liquidation store owned by Rebecca. You analyze sales data and give concise, actionable business insights. Always be direct, specific, and use dollar figures when relevant. Keep responses to 2-3 sentences max. Do not use em dashes or en dashes in your responses.`

const PROMPTS: Record<string, (data: any) => string> = {
  overview: (d) =>
    `Sales period: ${d.days} days (${d.periodLabel ?? 'current period'}). Revenue: $${d.totalSales.toFixed(0)}, Orders: ${d.totalOrders}, AOV: $${d.aov.toFixed(2)}, Best day: $${d.bestDay.toFixed(0)}. YoY vs 2025 same period: revenue +${d.yoySales.toFixed(1)}%, orders +${d.yoyOrders.toFixed(1)}%. Give me a 2-sentence executive summary and the single most important action item.`,

  dayOfWeek: (d) =>
    `Day of week average sales data (2026 YTD): ${JSON.stringify(d.map((x: any) => ({ day: x.day, avgSales: Math.round(x.avgSales), avgOrders: x.avgOrders })))}. Which days are underperforming and what specific action could boost those days?`,

  weekly: (d) =>
    `Weekly sales trend (2026 YTD, ${d.length} weeks): ${JSON.stringify(d.map((w: any) => ({ week: w.week, sales: Math.round(w.sales), orders: w.orders, aov: Math.round(w.aov) })))}. Identify any trend, peak weeks, and one specific recommendation.`,

  products: (d) =>
    `Top 10 products by revenue (2026 YTD): ${JSON.stringify(d.slice(0, 10).map((p: any) => ({ name: p.name, revenue: Math.round(p.totalSales), units: p.unitsSold })))}. What's driving revenue and what product/category should Rebecca focus on to grow AOV?`,

  aov: (d) =>
    `Daily AOV trend over ${d.length} days (2026 YTD). Range: $${Math.min(...d.map((x: any) => x.aov)).toFixed(0)} to $${Math.max(...d.map((x: any) => x.aov)).toFixed(0)}, avg: $${(d.reduce((s: number, x: any) => s + x.aov, 0) / d.length).toFixed(2)}. What's causing fluctuation and how can Rebecca raise the floor on low-AOV days?`,
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not set. Add it to .env.local to enable Duck Norris.' },
      { status: 503 }
    )
  }

  try {
    const { section, data } = await req.json()
    const promptFn = PROMPTS[section]
    if (!promptFn) return NextResponse.json({ error: 'Unknown section' }, { status: 400 })

    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: SYSTEM,
      messages: [{ role: 'user', content: promptFn(data) }],
    })

    const insight = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ insight })
  } catch (err: any) {
    console.error('Insights API error:', err)
    return NextResponse.json({ error: err.message ?? 'Unknown error' }, { status: 500 })
  }
}
