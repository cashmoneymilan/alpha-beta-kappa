"use client"

import { useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  Settings,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  BarChart3
} from "lucide-react"

// Style configuration types
type StyleVariant = "terminal" | "modern" | "hybrid"

interface StyleConfig {
  name: string
  description: string
  container: string
  card: string
  cardHeader: string
  button: {
    primary: string
    buy: string
    sell: string
    ghost: string
  }
  input: string
  select: string
  badge: {
    bullish: string
    bearish: string
    pending: string
    filled: string
  }
  table: {
    header: string
    row: string
    cell: string
  }
  text: {
    primary: string
    secondary: string
    muted: string
  }
}

const styles: Record<StyleVariant, StyleConfig> = {
  terminal: {
    name: "Terminal",
    description: "Bloomberg-inspired. Dense, monospace, amber accents.",
    container: "bg-[#0a0a0a] border-zinc-800",
    card: "bg-[#0f0f0f] border border-zinc-800 rounded-none",
    cardHeader: "border-b border-zinc-800 bg-zinc-900/50 px-3 py-2",
    button: {
      primary: "bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs uppercase tracking-wider rounded-none",
      buy: "bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs uppercase tracking-wider rounded-none",
      sell: "bg-red-600 hover:bg-red-500 text-white font-mono text-xs uppercase tracking-wider rounded-none",
      ghost: "text-amber-500 hover:bg-zinc-800 font-mono text-xs uppercase tracking-wider rounded-none",
    },
    input: "bg-zinc-900 border-zinc-700 text-amber-500 placeholder:text-zinc-600 font-mono text-sm rounded-none focus:border-amber-500 focus:ring-amber-500/20",
    select: "bg-zinc-900 border-zinc-700 text-amber-500 font-mono text-sm rounded-none",
    badge: {
      bullish: "bg-emerald-900/50 text-emerald-400 border border-emerald-700 font-mono text-[10px] uppercase rounded-none",
      bearish: "bg-red-900/50 text-red-400 border border-red-700 font-mono text-[10px] uppercase rounded-none",
      pending: "bg-amber-900/50 text-amber-400 border border-amber-700 font-mono text-[10px] uppercase rounded-none",
      filled: "bg-blue-900/50 text-blue-400 border border-blue-700 font-mono text-[10px] uppercase rounded-none",
    },
    table: {
      header: "bg-zinc-900 text-zinc-500 font-mono text-[10px] uppercase tracking-wider",
      row: "border-b border-zinc-800 hover:bg-zinc-900",
      cell: "font-mono text-xs py-2 px-3",
    },
    text: {
      primary: "text-zinc-100 font-mono",
      secondary: "text-amber-500 font-mono",
      muted: "text-zinc-500 font-mono text-xs",
    },
  },
  modern: {
    name: "Modern",
    description: "Linear/Vercel-inspired. Clean, spacious, indigo accents.",
    container: "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800",
    card: "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm",
    cardHeader: "border-b border-zinc-100 dark:border-zinc-800 px-4 py-3",
    button: {
      primary: "bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg shadow-sm",
      buy: "bg-emerald-500 hover:bg-emerald-400 text-white font-medium text-sm rounded-lg shadow-sm",
      sell: "bg-rose-500 hover:bg-rose-400 text-white font-medium text-sm rounded-lg shadow-sm",
      ghost: "text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 font-medium text-sm rounded-lg",
    },
    input: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 text-sm rounded-lg focus:border-indigo-500 focus:ring-indigo-500/20",
    select: "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm rounded-lg",
    badge: {
      bullish: "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-medium text-xs rounded-full",
      bearish: "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-medium text-xs rounded-full",
      pending: "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-medium text-xs rounded-full",
      filled: "bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-medium text-xs rounded-full",
    },
    table: {
      header: "bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 font-medium text-xs uppercase tracking-wide",
      row: "border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
      cell: "text-sm py-3 px-4",
    },
    text: {
      primary: "text-zinc-900 dark:text-zinc-100",
      secondary: "text-indigo-600 dark:text-indigo-400",
      muted: "text-zinc-500 dark:text-zinc-400 text-sm",
    },
  },
  hybrid: {
    name: "Hybrid",
    description: "Dark mode with modern polish. Dense but refined.",
    container: "bg-[#0d0d12] border-zinc-800",
    card: "bg-[#16161e] border border-zinc-800/50 rounded-lg shadow-lg shadow-black/20",
    cardHeader: "border-b border-zinc-800/50 px-4 py-3 bg-zinc-900/30",
    button: {
      primary: "bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-md",
      buy: "bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-md",
      sell: "bg-red-600 hover:bg-red-500 text-white font-medium text-sm rounded-md",
      ghost: "text-zinc-300 hover:bg-zinc-800 font-medium text-sm rounded-md",
    },
    input: "bg-zinc-900/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 text-sm rounded-md focus:border-indigo-500 focus:ring-indigo-500/20",
    select: "bg-zinc-900/50 border-zinc-700 text-zinc-100 text-sm rounded-md",
    badge: {
      bullish: "bg-emerald-500/15 text-emerald-400 font-medium text-xs rounded-md",
      bearish: "bg-red-500/15 text-red-400 font-medium text-xs rounded-md",
      pending: "bg-amber-500/15 text-amber-400 font-medium text-xs rounded-md",
      filled: "bg-indigo-500/15 text-indigo-400 font-medium text-xs rounded-md",
    },
    table: {
      header: "bg-zinc-900/50 text-zinc-400 font-medium text-xs uppercase tracking-wide",
      row: "border-b border-zinc-800/50 hover:bg-zinc-800/30",
      cell: "text-sm py-2.5 px-3",
    },
    text: {
      primary: "text-zinc-100",
      secondary: "text-indigo-400",
      muted: "text-zinc-400 text-sm",
    },
  },
}

function StylePanel({ variant }: { variant: StyleVariant }) {
  const s = styles[variant]

  return (
    <div className={`${s.container} border rounded-lg overflow-hidden`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-inherit">
        <h3 className={`text-lg font-semibold ${s.text.primary}`}>{s.name}</h3>
        <p className={s.text.muted}>{s.description}</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Buttons Section */}
        <div>
          <h4 className={`text-xs uppercase tracking-wider mb-3 ${s.text.muted}`}>Buttons</h4>
          <div className="flex flex-wrap gap-2">
            <button className={`px-4 py-2 ${s.button.primary}`}>
              Primary Action
            </button>
            <button className={`px-4 py-2 flex items-center gap-2 ${s.button.buy}`}>
              <TrendingUp className="w-4 h-4" />
              Buy
            </button>
            <button className={`px-4 py-2 flex items-center gap-2 ${s.button.sell}`}>
              <TrendingDown className="w-4 h-4" />
              Sell
            </button>
            <button className={`px-4 py-2 flex items-center gap-2 ${s.button.ghost}`}>
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Order Form Section */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${s.text.primary}`}>New Order</span>
              <span className={`text-xs ${s.text.muted}`}>AAPL</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`block text-xs mb-1.5 ${s.text.muted}`}>Order Type</label>
                <div className={`flex items-center justify-between border px-3 py-2 ${s.select}`}>
                  <span>Market</span>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </div>
              </div>
              <div>
                <label className={`block text-xs mb-1.5 ${s.text.muted}`}>Quantity</label>
                <input
                  type="text"
                  placeholder="100"
                  className={`w-full px-3 py-2 border ${s.input}`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-xs mb-1.5 ${s.text.muted}`}>Limit Price</label>
              <input
                type="text"
                placeholder="$185.50"
                className={`w-full px-3 py-2 border ${s.input}`}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button className={`flex-1 py-2.5 flex items-center justify-center gap-2 ${s.button.buy}`}>
                <ArrowUpRight className="w-4 h-4" />
                Buy 100 Shares
              </button>
              <button className={`flex-1 py-2.5 flex items-center justify-center gap-2 ${s.button.sell}`}>
                <ArrowDownRight className="w-4 h-4" />
                Sell 100 Shares
              </button>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div>
          <h4 className={`text-xs uppercase tracking-wider mb-3 ${s.text.muted}`}>Status Badges</h4>
          <div className="flex flex-wrap gap-2">
            <span className={`px-2.5 py-1 ${s.badge.bullish}`}>Bullish +2.5%</span>
            <span className={`px-2.5 py-1 ${s.badge.bearish}`}>Bearish -1.2%</span>
            <span className={`px-2.5 py-1 ${s.badge.pending}`}>Pending</span>
            <span className={`px-2.5 py-1 ${s.badge.filled}`}>Filled</span>
          </div>
        </div>

        {/* Table Section */}
        <div className={s.card}>
          <div className={s.cardHeader}>
            <span className={`text-sm font-medium ${s.text.primary}`}>Positions</span>
          </div>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className={s.table.header}>
                  <th className={`text-left ${s.table.cell}`}>Symbol</th>
                  <th className={`text-right ${s.table.cell}`}>Qty</th>
                  <th className={`text-right ${s.table.cell}`}>P&L</th>
                  <th className={`text-right ${s.table.cell}`}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className={s.table.row}>
                  <td className={`${s.table.cell} ${s.text.primary}`}>AAPL</td>
                  <td className={`${s.table.cell} text-right ${s.text.primary}`}>100</td>
                  <td className={`${s.table.cell} text-right text-emerald-400`}>+$1,250.00</td>
                  <td className={`${s.table.cell} text-right`}>
                    <span className={`px-2 py-0.5 ${s.badge.bullish}`}>Long</span>
                  </td>
                </tr>
                <tr className={s.table.row}>
                  <td className={`${s.table.cell} ${s.text.primary}`}>NVDA</td>
                  <td className={`${s.table.cell} text-right ${s.text.primary}`}>50</td>
                  <td className={`${s.table.cell} text-right text-red-400`}>-$340.00</td>
                  <td className={`${s.table.cell} text-right`}>
                    <span className={`px-2 py-0.5 ${s.badge.bearish}`}>Short</span>
                  </td>
                </tr>
                <tr className={s.table.row}>
                  <td className={`${s.table.cell} ${s.text.primary}`}>TSLA</td>
                  <td className={`${s.table.cell} text-right ${s.text.primary}`}>25</td>
                  <td className={`${s.table.cell} text-right text-emerald-400`}>+$890.50</td>
                  <td className={`${s.table.cell} text-right`}>
                    <span className={`px-2 py-0.5 ${s.badge.pending}`}>Pending</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Feed Card Section */}
        <div className={s.card}>
          <div className="p-4 flex gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${variant === 'terminal' ? 'bg-amber-500/20' : variant === 'modern' ? 'bg-indigo-100 dark:bg-indigo-950' : 'bg-indigo-500/20'}`}>
              <Zap className={`w-4 h-4 ${variant === 'terminal' ? 'text-amber-500' : 'text-indigo-500 dark:text-indigo-400'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-medium ${s.text.primary}`}>MarketPulse Alert</span>
                <span className={`px-2 py-0.5 ${s.badge.bullish}`}>High Activity</span>
              </div>
              <p className={s.text.muted}>Unusual options activity detected in NVDA - 10x average volume on $150 calls</p>
              <div className="flex items-center gap-4 mt-2">
                <span className={`text-xs ${s.text.muted}`}>2 min ago</span>
                <span className={`text-xs flex items-center gap-1 ${variant === 'terminal' ? 'text-amber-500' : 'text-indigo-500 dark:text-indigo-400'}`}>
                  <Activity className="w-3 h-3" />
                  Signal strength: 8.5
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShadcnDemoPage() {
  const [selectedStyles, setSelectedStyles] = useState<StyleVariant[]>(["terminal", "modern", "hybrid"])

  const toggleStyle = (style: StyleVariant) => {
    setSelectedStyles(prev =>
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">shadcn/ui Aesthetic Demo</h1>
                <p className="text-xs text-zinc-500">
                  Compare UI styles for the trading terminal redesign
                </p>
              </div>
            </div>

            {/* Style Toggles */}
            <div className="flex items-center gap-2">
              {(Object.keys(styles) as StyleVariant[]).map((style) => (
                <button
                  key={style}
                  onClick={() => toggleStyle(style)}
                  className={`
                    px-3 py-1.5 rounded-md text-sm font-medium transition-all
                    ${selectedStyles.includes(style)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }
                  `}
                >
                  {styles[style].name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      <div className="bg-indigo-600/10 border-b border-indigo-600/20">
        <div className="max-w-[1800px] mx-auto px-6 py-3">
          <p className="text-sm text-indigo-300">
            <strong>Choose your aesthetic direction.</strong> Each style shows the same components with different visual treatments.
            Terminal is dense and data-focused. Modern is clean and spacious. Hybrid balances both approaches.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-6">
        {selectedStyles.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-zinc-500">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No styles selected</p>
              <p className="text-sm mt-1">
                Click on styles above to start comparing
              </p>
            </div>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            selectedStyles.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' :
            selectedStyles.length === 2 ? 'grid-cols-2' :
            'grid-cols-3'
          }`}>
            {selectedStyles.map((style) => (
              <StylePanel key={style} variant={style} />
            ))}
          </div>
        )}

        {/* Component Reference */}
        <div className="mt-12 border-t border-zinc-800 pt-8">
          <h2 className="text-lg font-semibold mb-4">Components Demonstrated</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Buttons", desc: "Primary, Buy/Sell, Ghost variants" },
              { name: "Inputs", desc: "Text inputs with labels" },
              { name: "Selects", desc: "Dropdown selections" },
              { name: "Badges", desc: "Status indicators" },
              { name: "Cards", desc: "Container components" },
              { name: "Tables", desc: "Data display" },
              { name: "Feed Cards", desc: "Alert/signal displays" },
              { name: "Typography", desc: "Text hierarchy" },
            ].map((item) => (
              <div key={item.name} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                <h4 className="text-sm font-medium text-zinc-100">{item.name}</h4>
                <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Prompt */}
        <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Ready to Choose?</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Once you pick an aesthetic direction, the full shadcn/ui integration will be styled consistently.
            The chosen style will be applied to all tiles: TradeTile, PortfolioTile, MarketPulse, ChartTile, and more.
          </p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg">
              Confirm Selection
            </button>
            <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg">
              View More Examples
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
