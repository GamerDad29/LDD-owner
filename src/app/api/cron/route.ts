import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function GET(request: NextRequest) {
  // Vercel sends Authorization: Bearer <CRON_SECRET> for scheduled cron jobs
  const authHeader = request.headers.get('authorization')
  const expected   = `Bearer ${process.env.CRON_SECRET}`
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  revalidateTag('shopify-data')
  return NextResponse.json({ revalidated: true, timestamp: new Date().toISOString() })
}
