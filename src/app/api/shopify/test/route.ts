import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface Check {
  name: string
  passed: boolean
  detail: string
  ms?: number
}

export async function GET() {
  const checks: Check[] = []

  // 1. Env vars
  const store = process.env.SHOPIFY_STORE
  const token = process.env.SHOPIFY_ACCESS_TOKEN
  checks.push({
    name: 'SHOPIFY_STORE',
    passed: !!store,
    detail: store ? `${store.slice(0, 12)}...` : 'MISSING',
  })
  checks.push({
    name: 'SHOPIFY_ACCESS_TOKEN',
    passed: !!token,
    detail: token ? `${token.slice(0, 6)}...${token.slice(-4)}` : 'MISSING',
  })

  if (!store || !token) {
    return NextResponse.json({ ok: false, checks }, { status: 500 })
  }

  // 2. Shop ping
  const apiVersions = ['2026-01', '2025-01']
  let workingVersion = ''

  for (const version of apiVersions) {
    const url = `https://${store}/admin/api/${version}/graphql.json`
    const t0 = Date.now()
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({ query: '{ shop { name myshopifyDomain } }' }),
      })
      const ms = Date.now() - t0
      const data = await res.json()

      if (!res.ok) {
        checks.push({
          name: `Shop ping (${version})`,
          passed: false,
          detail: `HTTP ${res.status}: ${JSON.stringify(data).slice(0, 200)}`,
          ms,
        })
        continue
      }

      if (data.errors) {
        checks.push({
          name: `Shop ping (${version})`,
          passed: false,
          detail: `GraphQL errors: ${JSON.stringify(data.errors).slice(0, 200)}`,
          ms,
        })
        continue
      }

      const shopName = data.data?.shop?.name ?? 'unknown'
      checks.push({
        name: `Shop ping (${version})`,
        passed: true,
        detail: `Shop: ${shopName}`,
        ms,
      })
      workingVersion = version
      break
    } catch (err: any) {
      checks.push({
        name: `Shop ping (${version})`,
        passed: false,
        detail: `Network error: ${err.message}`,
        ms: Date.now() - t0,
      })
    }
  }

  // 3. ShopifyQL test query (actual daily query pattern)
  if (workingVersion) {
    const url = `https://${store}/admin/api/${workingVersion}/graphql.json`
    const ql = 'FROM sales SHOW total_sales, orders GROUP BY day SINCE -7d ORDER BY day'
    const escaped = ql.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    const t0 = Date.now()
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({
          query: `{ shopifyqlQuery(query: "${escaped}") { tableData { columns { name } rows } parseErrors } }`,
        }),
      })
      const ms = Date.now() - t0
      const data = await res.json()
      const result = data.data?.shopifyqlQuery

      if (result?.parseErrors?.length) {
        checks.push({
          name: 'ShopifyQL query',
          passed: false,
          detail: `Parse errors: ${JSON.stringify(result.parseErrors).slice(0, 200)}`,
          ms,
        })
      } else {
        const rows = result?.tableData?.rows?.length ?? 0
        checks.push({
          name: 'ShopifyQL query',
          passed: rows > 0,
          detail: rows > 0 ? `${rows} rows returned` : 'No rows returned (may be normal if no recent sales)',
          ms,
        })
      }
    } catch (err: any) {
      checks.push({
        name: 'ShopifyQL query',
        passed: false,
        detail: `Error: ${err.message}`,
        ms: Date.now() - t0,
      })
    }
  }

  // 4. Raw column inspection — show exactly what Shopify returns
  let rawColumns: any = null
  let rawFirstRow: any = null
  if (workingVersion) {
    const url = `https://${store}/admin/api/${workingVersion}/graphql.json`
    const ql = 'FROM sales SHOW gross_sales, net_sales, total_sales, orders GROUP BY day SINCE -7d ORDER BY day'
    const escaped = ql.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token,
        },
        body: JSON.stringify({
          query: `{ shopifyqlQuery(query: "${escaped}") { tableData { columns { name dataType } rows } parseErrors } }`,
        }),
      })
      const data = await res.json()
      const result = data.data?.shopifyqlQuery
      rawColumns = result?.tableData?.columns ?? []
      rawFirstRow = result?.tableData?.rows?.[0] ?? null
    } catch { /* ignore */ }
  }

  const allPassed = checks.every(c => c.passed)
  return NextResponse.json({
    ok: allPassed,
    apiVersion: workingVersion || null,
    checks,
    rawColumns,
    rawFirstRow,
  })
}
