import { NextResponse } from 'next/server'
import { fetchDashboardData } from '@/lib/shopify'

export async function GET() {
  try {
    const data = await fetchDashboardData()
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('Shopify data fetch failed:', err)
    const message = err?.message || 'Unknown error fetching Shopify data'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
