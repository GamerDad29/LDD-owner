import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const shop     = process.env.SHOPIFY_STORE!
  const clientId = process.env.SHOPIFY_CLIENT_ID!

  // Derive callback URL from the actual request host instead of hardcoding
  const url = new URL(request.url)
  const redirectUri = `${url.protocol}//${url.host}/api/shopify/callback`

  const scopes = 'read_orders,read_all_orders,read_reports,read_products,read_customers'

  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&grant_options[]=value`

  return NextResponse.redirect(authUrl)
}
