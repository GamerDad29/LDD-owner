# Lucky Duck Dealz — Owner Dashboard Backlog

> Organized by priority within each category. Items marked `[done]` are complete.
> Last updated: 2026-03-08

---

## 🔴 High Priority

### Profit First — Fixes & Features
- [x] **Add Cash Reserves allocation box** — Added as 7.5% percent-mode card with orange accent; included in pie chart and weekly breakdown
- [x] **Fix Profit First defaults** — Updated: 7.5% Profit, 7.5% Cash Reserves, 1% Owner's Pay, 8% Sales Tax, $14k Payroll (flat), $6.5k Operating (flat), Inventory = remainder
- [x] **Manual text input on Profit First fields** — Every card now has a typed input below the slider; percent cards show %, flat cards show $ with prefix
- [x] **Switch Payroll & Operating to flat dollar amounts** — Both cards now operate in flat $ mode with dollar sliders ($8k–$22k / $3k–$12k); Inventory auto-calculates as remainder

### Data & Accuracy
- [ ] **Update payroll rates to actuals** — `data/payroll.json` uses estimated hourly rates; replace with real rates for all 21 employees
- [ ] **Keep YTD data current** — `data/dailySales.json` last updated Feb 23, 2026; establish a process/schedule for weekly or daily updates
- [ ] **Validate product sales data** — confirm `productSales.json`, `productSales2024.json`, `productSales2025.json` align with POS system exports
- [ ] **Add 2026 monthly data file** — `monthly2026.json` is missing; only daily YTD data exists; add monthly aggregates as months close

### Security
- [ ] **Lock down dashboard access** — Dashboard is currently unprotected; implement access control before any public deployment; options: Vercel Password Protection (simplest), custom domain + Vercel auth, or a lightweight login page; owner prefers something low-friction

### Features
- [ ] **Data entry / update UI** — Currently all data is static JSON files; add an admin interface or import flow so data can be updated without editing raw files
- [ ] **Export to PDF / Print view** — Allow owner to print/export the dashboard or specific views (KPI summary, payroll report, profit allocation)

---

## 🟡 Medium Priority

### Phase 2 — Social Media & Advertising ROI
- [ ] **Ad spend tracker** — Log ad campaigns by platform (Instagram, Facebook, etc.), spend amount, and run dates; store in a new `adSpend.json` or data entry UI
- [ ] **Social media ROI calculator** — Correlate ad campaigns with sales/traffic/order data during and after campaign window; show impact on: revenue, order count, AOV, and specific product movement (e.g., "Summer" promo → swimwear sales lift)
- [x] **ROI target modeling** — New "Ad ROI Planner" view added; forward calc (spend → projected return) and reverse calc (set a revenue goal → required spend/lift); scenario comparison bar chart; baselines pulled from live dailySales data
- [ ] **Boosted post vs. created ad comparison** — When running paid social, compare performance of boosted posts (via boost button) vs. formally created ads (via Ad Manager); surface whether one consistently drives better lift in sales, orders, or AOV
- [ ] **Rewards customer metric** — Track how many rewards/loyalty customers are being added per period; surface as a KPI card and trend chart; owner can provide this data

### Features
- [ ] **Retail event / holiday flags on charts** — Overlay key retail dates on sales charts (Presidents Day, Spring Break, Memorial Day, 4th of July, Labor Day, Black Friday, Christmas, etc.) scoped to Mesa, AZ market; helps owner visually correlate revenue spikes with known traffic drivers
- [ ] **Sale day calendar flags** — Allow owner to mark specific days when a store sale was running; overlay these flags on sales trend charts to build data around customer draw and measure promotional lift over time
- [ ] **Returns analysis in Overview** — Returns data exists for all 3 years (`returns2024/2025/2026.json`) but isn't surfaced in the main Overview view; add a returns KPI card or chart
- [ ] **Expense tracking section** — Profit First allocations are calculated but no actual expense tracking exists; add a view to log and compare actual spend vs. allocation targets
- [ ] **Day-of-week performance card** — Duck Norris AI analyzes day-of-week patterns; surface this visually as a standalone heatmap or bar chart in the Sales view
- [ ] **Goals / Targets tracker** — Allow owner to set revenue, payroll %, and profit goals per month and track actual vs. target
- [ ] **Inventory allocation view** — Profit First includes an Inventory allocation category but there's no dedicated inventory section; add basic inventory cost tracking

### AI / Duck Norris
- [ ] **Persist Duck Norris insights** — Currently re-fetched on every visit; cache insights (localStorage or server-side) with a timestamp to reduce API calls
- [ ] **Add insight for returns trends** — Duck Norris currently analyzes: overview, day-of-week, weekly, products, AOV — add a `returns` insight section
- [ ] **Duck Norris "Ask a question" mode** — Free-form question input so owner can query their data conversationally beyond the 5 preset insight categories
- [ ] **Upgrade Duck Norris to claude-haiku-4-5** — Current model in `route.ts` may be using an outdated model ID; update to `claude-haiku-4-5-20251001`

### Technical Debt
- [ ] **Add CLAUDE.md** — No project context file exists for Claude Code; create one with architecture overview, key files, data formats, and conventions
- [ ] **Add README.md** — No README exists; document setup, env vars, data update process, and deployment
- [ ] **Remove or use framer-motion** — Package is installed (`package.json`) but not visibly used anywhere; either wire it into animations or remove to reduce bundle size
- [ ] **Centralize color tokens** — Gold `#e8b840` and other brand colors are hardcoded in multiple component files; move to Tailwind config or CSS variables

---

## 🟢 Low Priority / Nice to Have

### UX / Design
- [ ] **Mobile responsiveness** — Dashboard is designed for desktop; add responsive breakpoints for tablet/mobile access
- [ ] **Dark/light mode toggle** — Currently hardcoded dark theme; optional light mode for printing or accessibility
- [ ] **Keyboard navigation** — Improve accessibility for sidebar nav and toggle groups
- [ ] **Sidebar collapse persistence** — Sidebar collapse state resets on refresh; persist to localStorage

### Infrastructure
- [ ] **CI/CD pipeline** — No deployment config exists; add GitHub Actions or Vercel auto-deploy on push to main
- [ ] **Environment validation** — Add startup check that `ANTHROPIC_API_KEY` is set and valid; fail gracefully with a clear error in the UI if missing
- [ ] **Data version history** — Track when data files were last updated; display "data as of [date]" in the dashboard header

### Future Sections (Big Ideas)
- [ ] **Vendor / supplier tracker** — Log liquidation pallet purchases, cost basis, and ROI per vendor
- [ ] **Customer insights** — Repeat customer rate, average customer LTV (requires POS export with customer data)
- [ ] **Scheduling / staffing view** — Connect payroll data to scheduling to model coverage vs. cost by shift
- [ ] **Multi-location support** — If Lucky Duck Dealz expands, add location-level vs. aggregate reporting

---

## Notes

### Profit First — Confirmed Actual Defaults
| Category | Value | Type |
|----------|-------|------|
| Profit | 7.5% | % of revenue |
| Cash Reserves | 7.5% | % of revenue |
| Owner's Pay | 1% | % of revenue |
| Payroll | $14,000 | Flat weekly amount |
| Operating | $6,500 | Flat weekly amount |
| Inventory | Remainder | Whatever is left after above allocations |

- **Payroll target**: $14k flat (not a % of revenue); update calculator logic accordingly
- **Operating target**: $6.5k flat (not a % of revenue)
- **Duck Norris character**: System prompt defines personality in `src/app/api/insights/route.ts`; adjust tone/verbosity if needed

### Phase Roadmap
- **Phase 1 (Current)**: Financial dashboard — sales, payroll, Profit First, YoY, AI insights
- **Phase 2**: Social media & advertising ROI tracking, rewards customer metrics
- **Phase 3**: Security & access control, custom domain, deployment hardening
