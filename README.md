# Alpha Beta Kappa

A terminal-style trading dashboard that connects to Alpaca Markets for real-time market data, portfolio management, and trade execution — built as a Bloomberg-style workspace you can run yourself.

## What This Is

Alpha Beta Kappa is a professional trading terminal built on Next.js. It pulls live market data from Alpaca, lets you configure workspaces with tiled panels (price charts, order books, watchlists, alerts), and includes an onboarding flow to set up your interests and data sources. Designed to feel like a real trading desk — keyboard shortcuts, multiple workspaces, configurable themes.

## Features

- Live market data via Alpaca Markets API
- Tile-based workspace layout (drag, resize, configure)
- Order book with real-time depth
- Price alerts with notifications
- Multi-workspace support with keyboard shortcuts (⌘1–9)
- Reddit and news source integration
- SP500 + custom ticker seeding
- Supabase-backed persistence
- Terminal and modern UI themes

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js (Turborepo monorepo) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| Database | Supabase |
| Market Data | Alpaca Markets API |

## Getting Started

Requires Node.js 18+ and a free [Alpaca Markets](https://alpaca.markets) account (paper trading available).

```bash
npm install
cp apps/web/.env.local.example apps/web/.env.local
# Add your Alpaca API keys and Supabase credentials
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

## Seeding Data

```bash
# Seed S&P 500 tickers
npx ts-node apps/web/scripts/seed-sp500-tickers.ts

# Seed default data sources
npx ts-node apps/web/scripts/seed-sources.ts
```

## License

MIT
