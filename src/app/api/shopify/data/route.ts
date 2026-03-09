import { NextResponse } from 'next/server'
import { fetchDashboardData } from '@/lib/shopify'

export async function GET() {
  try {
    const data = await fetchDashboardData()
    return NextResponse.json(data)
  } catch (err) {
    console.error('Shopify data fetch failed:', err)
    return NextResponse.json({ error: 'Failed to fetch Shopify data' }, { status: 500 })
  }
}
