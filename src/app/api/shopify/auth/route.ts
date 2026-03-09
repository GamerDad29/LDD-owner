import { NextResponse } from 'next/server'

export async function GET() {
  const shop     = process.env.SHOPIFY_STORE!
  const clientId = process.env.SHOPIFY_CLIENT_ID!
  const redirectUri = 'https://ldd-owner-uqp9-53bhg1hj8-crichs-projects.vercel.app/api/shopify/callback'
  const scopes = 'read_orders,read_all_orders,read_reports,read_products,read_customers'

  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&grant_options[]=value`

  return NextResponse.redirect(authUrl)
}
