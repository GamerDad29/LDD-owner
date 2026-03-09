import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const shop = searchParams.get('shop')

  if (!code || !shop) {
    return new NextResponse(`
      <html>
        <body style="font-family: monospace; background: #07080f; color: #ff5252; padding: 40px;">
          <h2>Missing code or shop parameter.</h2>
          <p>Don't visit this page directly — use the authorization URL.</p>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })
  }

  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_CLIENT_ID,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET,
      code,
    }),
  })

  const data = await response.json() as { access_token?: string; error?: string }

  if (data.access_token) {
    return new NextResponse(`
      <html>
        <head><title>Shopify Connected</title></head>
        <body style="font-family: -apple-system, sans-serif; background: #07080f; color: #e8b840; padding: 48px; max-width: 700px; margin: 0 auto;">
          <h2 style="margin-bottom: 8px;">Shopify Connected!</h2>
          <p style="color: #888; margin-bottom: 24px;">Copy the token below and add it to Vercel as <code style="color:#e8b840">SHOPIFY_ACCESS_TOKEN</code>.</p>
          <div style="background: #111428; padding: 20px; border-radius: 10px; word-break: break-all; color: #fff; border: 1px solid rgba(232,184,64,0.2); font-family: monospace; font-size: 14px; margin-bottom: 24px;">
            ${data.access_token}
          </div>
          <p style="color: #555; font-size: 13px;">Once you have saved this to Vercel, this page can be safely ignored.</p>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } })
  }

  return new NextResponse(`
    <html>
      <body style="font-family: monospace; background: #07080f; color: #ff5252; padding: 40px;">
        <h2>Token exchange failed.</h2>
        <pre style="color: #888;">${JSON.stringify(data, null, 2)}</pre>
      </body>
    </html>
  `, { headers: { 'Content-Type': 'text/html' }, status: 500 })
}
