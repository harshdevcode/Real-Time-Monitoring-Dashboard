# InfraWatch — Infrastructure Monitoring Platform

A real-time infrastructure monitoring dashboard with a dark, terminal-inspired aesthetic. Built with Next.js 14, TypeScript, Chart.js, and Zustand.

## Tech Stack

| Layer       | Choice                                 |
|-------------|----------------------------------------|
| Framework   | Next.js 14 (App Router)                |
| Language    | TypeScript (strict)                    |
| Styling     | Tailwind CSS                           |
| Charts      | Chart.js + react-chartjs-2             |
| State       | Zustand                                |
| Date utils  | date-fns                               |
| Fonts       | JetBrains Mono + IBM Plex Sans         |

## Project Structure

```
infrawatch/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout + font import
│   │   ├── page.tsx                # Dashboard shell (TopBar + Sidebar + Main)
│   │   ├── globals.css             # Tailwind base + scanline overlay + scrollbars
│   │   └── SimulationProvider.tsx  # Client bootstrap for live sim
│   ├── components/
│   │   ├── charts/
│   │   │   ├── MetricChart.tsx     # 30-min CPU/MEM line chart (Chart.js)
│   │   │   └── TrafficDonut.tsx    # Traffic mix donut chart
│   │   ├── dashboard/
│   │   │   ├── OverviewDashboard.tsx  # Composes all dashboard sections
│   │   │   ├── StatCards.tsx          # 4 live stat cards with sparklines
│   │   │   ├── ServicesTable.tsx      # Service health table with mini bars
│   │   │   └── LogStream.tsx          # Auto-scrolling live log panel
│   │   ├── layout/
│   │   │   ├── TopBar.tsx          # Logo + tenant switcher + status + clock
│   │   │   └── Sidebar.tsx         # Nav items + node list + regions
│   │   └── ui/
│   │       ├── AlertStrip.tsx      # Dismissable alert banners
│   │       ├── Badge.tsx           # Status/label badges
│   │       ├── MiniBar.tsx         # Inline progress bar (thresholded color)
│   │       ├── Panel.tsx           # Card wrapper + PanelHeader
│   │       ├── SparkLine.tsx       # SVG sparkline
│   │       └── StatCard.tsx        # Top-accented metric card
│   ├── hooks/
│   │   ├── useClock.ts             # Live UTC clock, ticks every second
│   │   └── useLiveSimulation.ts    # Drives metric ticks + log appends
│   ├── lib/
│   │   ├── mockData.ts             # Seed data, generators, log templates
│   │   └── utils.ts                # cn(), thresholdColor(), formatNumber(), toSparkPoints()
│   ├── store/
│   │   └── infraStore.ts           # Zustand store — all global state + actions
│   └── types/
│       └── index.ts                # All TypeScript interfaces & types
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
└── postcss.config.mjs
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open in browser
open http://localhost:3000
```

## Key Architecture Decisions

### Zustand for state
A single flat store in `infraStore.ts` owns all runtime state — metrics, logs, alerts, nodes, services, and active tenant. This makes any component a pure subscriber with no prop drilling.

### Live simulation
`useLiveSimulation` (mounted once in `SimulationProvider`) drives two timers:
- `setInterval(tickMetrics, 2000)` — nudges CPU/mem/rps/latency with random walks and appends a new `MetricPoint` to history
- A recursive `setTimeout` at ~1400ms ± 400ms randomness — appends log entries

### Chart.js imperative pattern
Charts are constructed imperatively in `useEffect` and updated via `.update("none")` on each render. This avoids re-mounting the canvas on every data tick and keeps animations smooth.

### Threshold coloring
`thresholdColor(v)` returns `"green" | "amber" | "red"` based on numeric thresholds (>80 = red, >60 = amber). Used consistently across stat cards, service table cells, and mini bars.

## Extending the Project

- **Real data**: Replace `mockData.ts` generators with WebSocket / SSE connections to Prometheus, Datadog, or a custom metrics API
- **React Query**: Wrap the store's metric fetching with `@tanstack/react-query` for polling, caching, and stale-while-revalidate
- **More views**: Topology (force-directed D3 graph), Traces (waterfall chart), Alerts page (filterable table)
- **Auth**: Add NextAuth.js for per-tenant RBAC
- **Testing**: Vitest + React Testing Library for component tests; Playwright for E2E
