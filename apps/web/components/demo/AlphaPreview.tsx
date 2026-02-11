'use client';

import { useState } from 'react';
import {
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  Bell,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  Twitter,
  Rss,
  Grid3X3,
  List,
  BarChart3,
  Settings,
  Bookmark,
  Search,
  Command,
  ChevronDown,
  Check,
  MoreHorizontal,
  RefreshCw,
  X,
  Info,
  HelpCircle,
  Inbox,
  Clock,
  Filter,
  Maximize2,
  Minimize2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { alphaColors, alphaStructure } from './themes/alpha-hybrid';

const hsl = (value: string) => `hsl(${value})`;

export function AlphaPreview() {
  const [symbol, setSymbol] = useState('AAPL');
  const [quantity, setQuantity] = useState(100);
  const [price, setPrice] = useState(175.5);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');
  const [activeSide, setActiveSide] = useState<'buy' | 'sell'>('buy');
  const [activeTab, setActiveTab] = useState('positions');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [commandQuery, setCommandQuery] = useState('');

  const colors = alphaColors;
  const structure = alphaStructure;

  // Sparkline renderer
  const renderSparkline = (data: number[], color: string) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 60;
    const height = 20;
    const points = data
      .map((value, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');
    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: hsl(colors['--demo-background']),
        color: hsl(colors['--demo-foreground']),
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ========== TILE HEADER (Arctic) ========== */}
      <header
        className="border-b flex items-center justify-between"
        style={{
          height: structure.tileHeaders.height,
          padding: structure.tileHeaders.padding,
          borderColor: hsl(colors['--demo-border']),
          backgroundColor: hsl(colors['--demo-card']),
          fontFamily: structure.tileHeaders.fontFamily,
        }}
      >
        <div className="flex items-center gap-3">
          <h1
            style={{
              fontSize: structure.tileHeaders.fontSize,
              fontWeight: structure.tileHeaders.fontWeight,
            }}
          >
            Alpha Terminal Preview
          </h1>
          <span
            className="text-xs px-2 py-0.5"
            style={{
              backgroundColor: hsl(colors['--demo-bullish'] + ' / 0.15'),
              color: hsl(colors['--demo-bullish']),
              borderRadius: structure.badges.borderRadius,
            }}
          >
            All 15 Components
          </span>
        </div>

        {/* NAVIGATION (Sunset - rounded, soft) */}
        <nav className="flex gap-2" style={{ fontFamily: structure.navigation.fontFamily }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Grid3X3 },
            { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
            { id: 'alerts', label: 'Alerts', icon: Bell, badge: 3 },
          ].map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveNav(id)}
              className="flex items-center gap-2 transition-all"
              style={{
                padding: structure.navigation.padding,
                borderRadius: structure.navigation.borderRadius,
                fontWeight: structure.navigation.fontWeight,
                backgroundColor: activeNav === id ? hsl(colors['--demo-primary'] + ' / 0.15') : 'transparent',
                color: activeNav === id ? hsl(colors['--demo-primary']) : hsl(colors['--demo-muted-foreground']),
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
              {badge && (
                <span
                  className="px-1.5 py-0.5 text-xs font-bold rounded-full"
                  style={{ backgroundColor: hsl(colors['--demo-destructive']), color: 'white' }}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </header>

      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* COMMAND PALETTE TRIGGER (Bloomberg) */}
          <div className="mb-4">
            <button
              onClick={() => setShowCommand(true)}
              className="flex items-center gap-2 w-full max-w-md"
              style={{
                height: structure.commandPalette.inputHeight,
                padding: '0 16px',
                backgroundColor: hsl(colors['--demo-card']),
                border: `1px solid ${hsl(colors['--demo-border'])}`,
                borderRadius: structure.commandPalette.borderRadius,
                fontFamily: structure.commandPalette.fontFamily,
                fontSize: structure.commandPalette.inputFontSize,
                color: hsl(colors['--demo-muted-foreground']),
              }}
            >
              <Search className="w-4 h-4" />
              <span>Search symbols, commands...</span>
              <div className="ml-auto flex gap-1">
                <kbd
                  className="px-1.5 py-0.5 text-xs"
                  style={{
                    backgroundColor: hsl(colors['--demo-muted']),
                    borderRadius: '2px',
                    fontFamily: structure.commandPalette.fontFamily,
                  }}
                >
                  <Command className="w-3 h-3 inline" />
                </kbd>
                <kbd
                  className="px-1.5 py-0.5 text-xs"
                  style={{
                    backgroundColor: hsl(colors['--demo-muted']),
                    borderRadius: '2px',
                    fontFamily: structure.commandPalette.fontFamily,
                  }}
                >
                  K
                </kbd>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* ========== LEFT COLUMN ========== */}
            <div className="col-span-3 space-y-4">
              {/* FORMS (Bloomberg - dense, monospace) */}
              <div
                style={{
                  backgroundColor: hsl(colors['--demo-card']),
                  borderRadius: structure.cards.borderRadius,
                  border: `${structure.cards.borderWidth} solid ${hsl(colors['--demo-border'])}`,
                }}
              >
                {/* Tile Header */}
                <div
                  className="flex items-center justify-between border-b"
                  style={{
                    height: structure.tileHeaders.height,
                    padding: structure.tileHeaders.padding,
                    borderColor: hsl(colors['--demo-border']),
                    fontFamily: structure.tileHeaders.fontFamily,
                  }}
                >
                  <span style={{ fontSize: structure.tileHeaders.fontSize, fontWeight: structure.tileHeaders.fontWeight }}>
                    Order Entry
                  </span>
                  <button className="p-1 rounded hover:bg-white/5">
                    <MoreHorizontal className="w-4 h-4" style={{ color: hsl(colors['--demo-muted-foreground']) }} />
                  </button>
                </div>

                <div className="p-4" style={{ fontFamily: structure.forms.fontFamily }}>
                  {/* Buy/Sell Toggle - BUTTONS (Retro) */}
                  <div
                    className="flex mb-4 p-1"
                    style={{ backgroundColor: hsl(colors['--demo-muted']), borderRadius: structure.buttons.borderRadius }}
                  >
                    {(['buy', 'sell'] as const).map((side) => (
                      <button
                        key={side}
                        onClick={() => setActiveSide(side)}
                        className="flex-1 py-2 uppercase transition-all"
                        style={{
                          borderRadius: structure.buttons.borderRadius,
                          fontFamily: structure.buttons.fontFamily,
                          fontWeight: structure.buttons.fontWeight,
                          letterSpacing: structure.buttons.letterSpacing,
                          backgroundColor: activeSide === side
                            ? hsl(side === 'buy' ? colors['--demo-bullish'] : colors['--demo-bearish'])
                            : 'transparent',
                          color: activeSide === side
                            ? (side === 'buy' ? hsl(colors['--demo-background']) : 'white')
                            : hsl(colors['--demo-muted-foreground']),
                          boxShadow: activeSide === side
                            ? `0 0 15px ${hsl((side === 'buy' ? colors['--demo-bullish'] : colors['--demo-bearish']) + ' / 0.4')}`
                            : 'none',
                          textShadow: activeSide === side ? '0 0 10px currentColor' : 'none',
                        }}
                      >
                        {side}
                      </button>
                    ))}
                  </div>

                  {/* Symbol with Dropdown */}
                  <div className="mb-3 relative">
                    <label
                      className="block mb-1.5 uppercase"
                      style={{
                        fontSize: structure.forms.labelSize,
                        fontWeight: structure.forms.labelWeight,
                        letterSpacing: structure.forms.labelSpacing,
                        color: hsl(colors['--demo-muted-foreground']),
                      }}
                    >
                      Symbol
                    </label>
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="w-full flex items-center justify-between"
                      style={{
                        height: structure.forms.height,
                        padding: structure.forms.padding,
                        backgroundColor: hsl(colors['--demo-input']),
                        border: `1px solid ${hsl(colors['--demo-border'])}`,
                        borderRadius: structure.forms.borderRadius,
                        fontFamily: structure.forms.fontFamily,
                        fontSize: structure.forms.fontSize,
                        color: hsl(colors['--demo-foreground']),
                      }}
                    >
                      <span className="font-bold">{symbol}</span>
                      <ChevronDown className="w-4 h-4" style={{ color: hsl(colors['--demo-muted-foreground']) }} />
                    </button>

                    {/* DROPDOWN (Bloomberg - dense) */}
                    {showDropdown && (
                      <div
                        className="absolute top-full left-0 right-0 mt-1 z-20 py-1"
                        style={{
                          backgroundColor: hsl(colors['--demo-card']),
                          border: `1px solid ${hsl(colors['--demo-border'])}`,
                          borderRadius: structure.dropdowns.borderRadius,
                          fontFamily: structure.dropdowns.fontFamily,
                          fontSize: structure.dropdowns.fontSize,
                          boxShadow: structure.dropdowns.shadow,
                          maxHeight: structure.dropdowns.maxHeight,
                          overflow: 'auto',
                        }}
                      >
                        {['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL'].map((s) => (
                          <button
                            key={s}
                            onClick={() => { setSymbol(s); setShowDropdown(false); }}
                            className="w-full text-left flex items-center justify-between hover:bg-white/5"
                            style={{ padding: structure.dropdowns.itemPadding }}
                          >
                            <span className="font-bold">{s}</span>
                            {s === symbol && <Check className="w-3 h-3" style={{ color: hsl(colors['--demo-primary']) }} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="mb-3">
                    <label
                      className="block mb-1.5 uppercase"
                      style={{
                        fontSize: structure.forms.labelSize,
                        fontWeight: structure.forms.labelWeight,
                        letterSpacing: structure.forms.labelSpacing,
                        color: hsl(colors['--demo-muted-foreground']),
                      }}
                    >
                      Quantity
                    </label>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 10))}
                        className="px-3 flex items-center justify-center"
                        style={{
                          height: structure.forms.height,
                          backgroundColor: hsl(colors['--demo-muted']),
                          border: `1px solid ${hsl(colors['--demo-border'])}`,
                          borderRadius: structure.forms.borderRadius,
                        }}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="flex-1 text-center outline-none"
                        style={{
                          height: structure.forms.height,
                          backgroundColor: hsl(colors['--demo-input']),
                          border: `1px solid ${hsl(colors['--demo-border'])}`,
                          borderRadius: structure.forms.borderRadius,
                          fontFamily: structure.forms.fontFamily,
                          fontSize: structure.forms.fontSize,
                          color: hsl(colors['--demo-foreground']),
                        }}
                      />
                      <button
                        onClick={() => setQuantity(quantity + 10)}
                        className="px-3 flex items-center justify-center"
                        style={{
                          height: structure.forms.height,
                          backgroundColor: hsl(colors['--demo-muted']),
                          border: `1px solid ${hsl(colors['--demo-border'])}`,
                          borderRadius: structure.forms.borderRadius,
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Order Type Toggle */}
                  <div className="mb-3">
                    <label
                      className="block mb-1.5 uppercase"
                      style={{
                        fontSize: structure.forms.labelSize,
                        fontWeight: structure.forms.labelWeight,
                        letterSpacing: structure.forms.labelSpacing,
                        color: hsl(colors['--demo-muted-foreground']),
                      }}
                    >
                      Type
                    </label>
                    <div className="flex p-0.5" style={{ backgroundColor: hsl(colors['--demo-muted']), borderRadius: structure.forms.borderRadius }}>
                      {(['market', 'limit'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => setOrderType(type)}
                          className="flex-1 py-1.5 uppercase text-xs"
                          style={{
                            fontFamily: structure.forms.fontFamily,
                            fontWeight: '600',
                            borderRadius: structure.forms.borderRadius,
                            backgroundColor: orderType === type ? hsl(colors['--demo-card']) : 'transparent',
                            color: orderType === type ? hsl(colors['--demo-foreground']) : hsl(colors['--demo-muted-foreground']),
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Limit Price */}
                  {orderType === 'limit' && (
                    <div className="mb-4">
                      <label
                        className="block mb-1.5 uppercase"
                        style={{
                          fontSize: structure.forms.labelSize,
                          fontWeight: structure.forms.labelWeight,
                          letterSpacing: structure.forms.labelSpacing,
                          color: hsl(colors['--demo-muted-foreground']),
                        }}
                      >
                        Limit Price
                      </label>
                      <div className="relative">
                        <span
                          className="absolute left-2 top-1/2 -translate-y-1/2"
                          style={{ color: hsl(colors['--demo-muted-foreground']), fontSize: structure.forms.fontSize }}
                        >
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          className="w-full pl-6 outline-none"
                          style={{
                            height: structure.forms.height,
                            padding: structure.forms.padding,
                            paddingLeft: '24px',
                            backgroundColor: hsl(colors['--demo-input']),
                            border: `1px solid ${hsl(colors['--demo-border'])}`,
                            borderRadius: structure.forms.borderRadius,
                            fontFamily: structure.forms.fontFamily,
                            fontSize: structure.forms.fontSize,
                            color: hsl(colors['--demo-foreground']),
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit BUTTON (Retro - glow) */}
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full uppercase flex items-center justify-center"
                    style={{
                      height: structure.buttons.height.lg,
                      fontFamily: structure.buttons.fontFamily,
                      fontWeight: structure.buttons.fontWeight,
                      letterSpacing: structure.buttons.letterSpacing,
                      borderRadius: structure.buttons.borderRadius,
                      border: structure.buttons.border,
                      borderColor: hsl(activeSide === 'buy' ? colors['--demo-bullish'] : colors['--demo-bearish']),
                      backgroundColor: hsl(activeSide === 'buy' ? colors['--demo-bullish'] : colors['--demo-bearish']),
                      color: activeSide === 'buy' ? hsl(colors['--demo-background']) : 'white',
                      boxShadow: `0 0 20px ${hsl((activeSide === 'buy' ? colors['--demo-bullish'] : colors['--demo-bearish']) + ' / 0.5')}`,
                      textShadow: '0 0 10px currentColor',
                    }}
                  >
                    {activeSide === 'buy' ? 'Buy' : 'Sell'} {symbol}
                  </button>
                </div>
              </div>

              {/* BADGES (Midnight Pro - refined) */}
              <div
                className="p-4"
                style={{
                  backgroundColor: hsl(colors['--demo-card']),
                  borderRadius: structure.cards.borderRadius,
                  border: `${structure.cards.borderWidth} solid ${hsl(colors['--demo-border'])}`,
                }}
              >
                <div
                  className="text-xs uppercase mb-3"
                  style={{ color: hsl(colors['--demo-muted-foreground']), letterSpacing: '0.1em', fontWeight: '600' }}
                >
                  Status Badges
                </div>
                <div className="flex flex-wrap gap-2" style={{ fontFamily: structure.badges.fontFamily }}>
                  {[
                    { label: 'Active', color: colors['--demo-bullish'] },
                    { label: 'Pending', color: colors['--demo-accent'] },
                    { label: 'Filled', color: colors['--demo-primary'] },
                  ].map((badge) => (
                    <span
                      key={badge.label}
                      style={{
                        padding: structure.badges.padding,
                        borderRadius: structure.badges.borderRadius,
                        fontSize: structure.badges.fontSize,
                        fontWeight: structure.badges.fontWeight,
                        backgroundColor: hsl(badge.color + ' / 0.15'),
                        color: hsl(badge.color),
                      }}
                    >
                      {badge.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ========== CENTER COLUMN ========== */}
            <div className="col-span-6 space-y-4">
              {/* TABLES (Arctic - crisp) with Tile Header */}
              <div
                style={{
                  backgroundColor: hsl(colors['--demo-card']),
                  borderRadius: structure.tables.borderRadius,
                  border: `${structure.tables.borderWidth} solid ${hsl(colors['--demo-border'])}`,
                  overflow: 'hidden',
                }}
              >
                {/* Header with tabs */}
                <div
                  className="flex items-center justify-between border-b"
                  style={{
                    height: structure.tileHeaders.height,
                    padding: structure.tileHeaders.padding,
                    borderColor: hsl(colors['--demo-border']),
                  }}
                >
                  <div className="flex gap-1">
                    {['positions', 'orders'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="px-3 py-1 text-xs font-medium capitalize"
                        style={{
                          borderRadius: structure.navigation.borderRadius,
                          backgroundColor: activeTab === tab ? hsl(colors['--demo-primary'] + ' / 0.1') : 'transparent',
                          color: activeTab === tab ? hsl(colors['--demo-primary']) : hsl(colors['--demo-muted-foreground']),
                        }}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 rounded hover:bg-white/5">
                      <RefreshCw className="w-3.5 h-3.5" style={{ color: hsl(colors['--demo-muted-foreground']) }} />
                    </button>
                    <button className="p-1 rounded hover:bg-white/5">
                      <Filter className="w-3.5 h-3.5" style={{ color: hsl(colors['--demo-muted-foreground']) }} />
                    </button>
                  </div>
                </div>

                <table className="w-full" style={{ fontFamily: structure.tables.fontFamily, fontSize: structure.tables.fontSize }}>
                  <thead>
                    <tr style={{ backgroundColor: hsl(colors['--demo-muted']) }}>
                      {['Symbol', 'Qty', 'Price', 'P&L', 'Chart'].map((h) => (
                        <th
                          key={h}
                          className="text-left"
                          style={{
                            padding: structure.tables.cellPadding,
                            fontSize: structure.tables.headerSize,
                            fontWeight: structure.tables.headerWeight,
                            color: hsl(colors['--demo-muted-foreground']),
                            borderBottom: `${structure.tables.borderWidth} solid ${hsl(colors['--demo-border'])}`,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { symbol: 'AAPL', qty: 100, price: 175.25, pl: 675, pct: 4.01, data: [20, 25, 22, 30, 28, 35, 40, 38, 45] },
                      { symbol: 'NVDA', qty: 50, price: 485.30, pl: 1765, pct: 7.84, data: [30, 35, 40, 38, 45, 50, 55, 60, 65] },
                      { symbol: 'TSLA', qty: 25, price: 245.80, pl: -480, pct: -7.25, data: [50, 48, 45, 42, 40, 38, 35, 32, 30] },
                    ].map((row) => (
                      <tr
                        key={row.symbol}
                        className="hover:bg-white/5 transition-colors"
                        style={{ borderBottom: `${structure.tables.borderWidth} solid ${hsl(colors['--demo-border'])}` }}
                      >
                        <td className="font-mono font-bold" style={{ padding: structure.tables.cellPadding }}>{row.symbol}</td>
                        <td className="font-mono" style={{ padding: structure.tables.cellPadding }}>{row.qty}</td>
                        <td className="font-mono" style={{ padding: structure.tables.cellPadding }}>${row.price.toFixed(2)}</td>
                        <td
                          className="font-mono font-medium"
                          style={{
                            padding: structure.tables.cellPadding,
                            color: row.pl >= 0 ? hsl(colors['--demo-bullish']) : hsl(colors['--demo-bearish']),
                          }}
                        >
                          {row.pl >= 0 ? '+' : ''}${row.pl.toFixed(0)} ({row.pct >= 0 ? '+' : ''}{row.pct}%)
                        </td>
                        {/* DATA VIZ - Sparkline (Bloomberg) */}
                        <td style={{ padding: structure.tables.cellPadding }}>
                          {renderSparkline(row.data, row.pl >= 0 ? hsl(colors['--demo-bullish']) : hsl(colors['--demo-bearish']))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* CARDS (Arctic) - Feed Items */}
              <div className="space-y-3">
                {[
                  { source: 'Twitter', icon: Twitter, handle: '@elonmusk', time: '2m', text: 'Tesla Cybertruck deliveries starting next week.', ticker: 'TSLA', sentiment: 'bullish' },
                  { source: 'RSS', icon: Rss, handle: 'Reuters', time: '15m', text: 'Fed signals potential rate hike in response to inflation.', ticker: 'SPY', sentiment: 'bearish' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="p-4 flex gap-3"
                    style={{
                      backgroundColor: hsl(colors['--demo-card']),
                      borderRadius: structure.cards.borderRadius,
                      border: `${structure.cards.borderWidth} solid ${hsl(colors['--demo-border'])}`,
                      fontFamily: structure.cards.fontFamily,
                    }}
                  >
                    <div
                      className="p-2 rounded flex-shrink-0"
                      style={{
                        backgroundColor: item.source === 'Twitter' ? 'hsl(200 100% 50% / 0.1)' : 'hsl(25 100% 50% / 0.1)',
                        color: item.source === 'Twitter' ? 'hsl(200 100% 50%)' : 'hsl(25 100% 50%)',
                      }}
                    >
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{item.handle}</span>
                        {/* TOOLTIP (Arctic) */}
                        <div className="relative">
                          <button
                            onMouseEnter={() => setShowTooltip(item.handle)}
                            onMouseLeave={() => setShowTooltip(null)}
                          >
                            <HelpCircle className="w-3 h-3" style={{ color: hsl(colors['--demo-muted-foreground']) }} />
                          </button>
                          {showTooltip === item.handle && (
                            <div
                              className="absolute bottom-full left-0 mb-2 z-30 whitespace-nowrap"
                              style={{
                                padding: structure.tooltips.padding,
                                backgroundColor: hsl(colors['--demo-card']),
                                border: `${structure.tooltips.borderWidth} solid ${hsl(colors['--demo-border'])}`,
                                borderRadius: structure.tooltips.borderRadius,
                                fontSize: structure.tooltips.fontSize,
                                fontFamily: structure.tooltips.fontFamily,
                                boxShadow: structure.tooltips.shadow,
                              }}
                            >
                              Alpha Score: 87 | Hit Rate: 72%
                            </div>
                          )}
                        </div>
                        <span className="text-xs" style={{ color: hsl(colors['--demo-muted-foreground']) }}>{item.time} ago</span>
                        <span
                          className="ml-auto"
                          style={{
                            padding: structure.badges.padding,
                            borderRadius: structure.badges.borderRadius,
                            fontSize: structure.badges.fontSize,
                            fontWeight: structure.badges.fontWeight,
                            backgroundColor: hsl((item.sentiment === 'bullish' ? colors['--demo-bullish'] : colors['--demo-bearish']) + ' / 0.15'),
                            color: hsl(item.sentiment === 'bullish' ? colors['--demo-bullish'] : colors['--demo-bearish']),
                          }}
                        >
                          {item.sentiment}
                        </span>
                      </div>
                      <p className="text-sm">{item.text}</p>
                      <span
                        className="inline-block mt-2 text-xs px-2 py-0.5 font-mono font-bold"
                        style={{ backgroundColor: hsl(colors['--demo-muted']), borderRadius: '4px' }}
                      >
                        ${item.ticker}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* EMPTY STATE (Bloomberg - compact) */}
              <div
                className="text-center"
                style={{
                  padding: structure.emptyStates.padding,
                  backgroundColor: hsl(colors['--demo-card']),
                  borderRadius: structure.cards.borderRadius,
                  border: `1px solid ${hsl(colors['--demo-border'])}`,
                  fontFamily: structure.emptyStates.fontFamily,
                }}
              >
                <Inbox
                  className="mx-auto mb-3"
                  style={{ width: structure.emptyStates.iconSize, height: structure.emptyStates.iconSize, color: hsl(colors['--demo-muted-foreground']) }}
                />
                <p style={{ fontSize: structure.emptyStates.titleSize, fontWeight: '600' }}>No pending orders</p>
                <p className="mt-1" style={{ fontSize: structure.emptyStates.descriptionSize, color: hsl(colors['--demo-muted-foreground']) }}>
                  Your open orders will appear here
                </p>
              </div>
            </div>

            {/* ========== RIGHT COLUMN ========== */}
            <div className="col-span-3 space-y-4">
              {/* Stats with DATA VIZ (Bloomberg) */}
              <div
                className="p-4"
                style={{
                  backgroundColor: hsl(colors['--demo-card']),
                  borderRadius: structure.cards.borderRadius,
                  border: `${structure.cards.borderWidth} solid ${hsl(colors['--demo-border'])}`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase" style={{ color: hsl(colors['--demo-muted-foreground']) }}>Portfolio</span>
                  <TrendingUp className="w-4 h-4" style={{ color: hsl(colors['--demo-bullish']) }} />
                </div>
                <div className="font-mono text-2xl font-bold">$125,430</div>
                <div className="text-sm font-medium" style={{ color: hsl(colors['--demo-bullish']) }}>+$3,245 (+2.65%)</div>

                {/* Progress bar (Bloomberg style) */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1" style={{ color: hsl(colors['--demo-muted-foreground']), fontFamily: structure.dataViz.fontFamily }}>
                    <span>Daily Goal</span>
                    <span>75%</span>
                  </div>
                  <div
                    className="overflow-hidden"
                    style={{ height: structure.dataViz.progressHeight, backgroundColor: hsl(colors['--demo-muted']), borderRadius: structure.dataViz.borderRadius }}
                  >
                    <div className="h-full" style={{ width: '75%', backgroundColor: hsl(colors['--demo-primary']) }} />
                  </div>
                </div>
              </div>

              {/* ALERTS (Arctic - crisp) */}
              <div className="space-y-2">
                {[
                  { icon: CheckCircle2, title: 'Order Filled', desc: '100 AAPL @ $175.25', type: 'success' },
                  { icon: AlertTriangle, title: 'Price Alert', desc: 'NVDA approaching $490', type: 'warning' },
                  { icon: Zap, title: 'Smart Money', desc: 'Large buy in MSFT', type: 'info' },
                ].map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3"
                    style={{
                      padding: structure.alerts.padding,
                      borderRadius: structure.alerts.borderRadius,
                      border: `${structure.alerts.borderWidth} solid ${hsl(
                        (alert.type === 'success' ? colors['--demo-bullish'] : alert.type === 'warning' ? colors['--demo-accent'] : colors['--demo-primary']) + ' / 0.3'
                      )}`,
                      backgroundColor: hsl(
                        (alert.type === 'success' ? colors['--demo-bullish'] : alert.type === 'warning' ? colors['--demo-accent'] : colors['--demo-primary']) + ' / 0.1'
                      ),
                      fontFamily: structure.alerts.fontFamily,
                    }}
                  >
                    <alert.icon
                      className="flex-shrink-0 mt-0.5"
                      style={{
                        width: structure.alerts.iconSize,
                        height: structure.alerts.iconSize,
                        color: hsl(alert.type === 'success' ? colors['--demo-bullish'] : alert.type === 'warning' ? colors['--demo-accent'] : colors['--demo-primary']),
                      }}
                    />
                    <div>
                      <div className="text-sm" style={{ fontWeight: structure.alerts.titleWeight }}>{alert.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: hsl(colors['--demo-muted-foreground']) }}>{alert.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* LOADING States (Bloomberg - minimal) */}
              <div
                className="p-4"
                style={{
                  backgroundColor: hsl(colors['--demo-card']),
                  borderRadius: structure.cards.borderRadius,
                  border: `1px solid ${hsl(colors['--demo-border'])}`,
                }}
              >
                <div className="text-xs uppercase mb-3" style={{ color: hsl(colors['--demo-muted-foreground']), letterSpacing: '0.1em' }}>
                  Loading States
                </div>
                <div className="flex items-center gap-4">
                  {/* Spinner */}
                  <div
                    className="rounded-full animate-spin"
                    style={{
                      width: structure.loading.spinnerSize.md,
                      height: structure.loading.spinnerSize.md,
                      border: `${structure.loading.spinnerStroke} solid ${hsl(colors['--demo-muted'])}`,
                      borderTopColor: hsl(colors['--demo-primary']),
                    }}
                  />
                  {/* Dots */}
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="rounded-full animate-pulse"
                        style={{
                          width: structure.loading.dotsSize,
                          height: structure.loading.dotsSize,
                          backgroundColor: hsl(colors['--demo-primary']),
                          animationDelay: `${i * 0.15}s`,
                        }}
                      />
                    ))}
                  </div>
                  {/* Skeleton */}
                  <div className="flex-1 space-y-1">
                    <div
                      className="h-3 animate-pulse"
                      style={{ backgroundColor: hsl(colors['--demo-muted']), borderRadius: structure.loading.skeletonRadius, width: '80%' }}
                    />
                    <div
                      className="h-3 animate-pulse"
                      style={{ backgroundColor: hsl(colors['--demo-muted']), borderRadius: structure.loading.skeletonRadius, width: '50%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MODAL (Arctic - clean) ========== */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: `rgba(0,0,0,${structure.modals.backdropOpacity})` }}
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '400px',
              backgroundColor: hsl(colors['--demo-card']),
              borderRadius: structure.modals.borderRadius,
              border: `1px solid ${hsl(colors['--demo-border'])}`,
              boxShadow: structure.modals.shadow,
              fontFamily: structure.modals.fontFamily,
            }}
          >
            <div
              className="flex items-center justify-between border-b"
              style={{ padding: structure.modals.padding.header, borderColor: hsl(colors['--demo-border']) }}
            >
              <h3 className="font-semibold">Confirm Order</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div style={{ padding: structure.modals.padding.body }} className="space-y-3">
              {[
                { label: 'Action', value: activeSide.toUpperCase(), color: activeSide === 'buy' ? colors['--demo-bullish'] : colors['--demo-bearish'] },
                { label: 'Symbol', value: symbol },
                { label: 'Quantity', value: quantity.toString() },
                { label: 'Price', value: `$${price.toFixed(2)}` },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span style={{ color: hsl(colors['--demo-muted-foreground']) }}>{row.label}</span>
                  <span className="font-mono font-bold" style={{ color: row.color ? hsl(row.color) : undefined }}>{row.value}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm pt-3 border-t" style={{ borderColor: hsl(colors['--demo-border']) }}>
                <span style={{ color: hsl(colors['--demo-muted-foreground']) }}>Total</span>
                <span className="font-mono font-bold">${(quantity * price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="flex gap-2 border-t" style={{ padding: structure.modals.padding.footer, borderColor: hsl(colors['--demo-border']) }}>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2"
                style={{
                  backgroundColor: hsl(colors['--demo-muted']),
                  borderRadius: structure.buttons.borderRadius,
                  fontFamily: structure.buttons.fontFamily,
                  fontWeight: '600',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 uppercase"
                style={{
                  backgroundColor: hsl(activeSide === 'buy' ? colors['--demo-bullish'] : colors['--demo-bearish']),
                  color: activeSide === 'buy' ? hsl(colors['--demo-background']) : 'white',
                  borderRadius: structure.buttons.borderRadius,
                  fontFamily: structure.buttons.fontFamily,
                  fontWeight: structure.buttons.fontWeight,
                  boxShadow: `0 0 15px ${hsl((activeSide === 'buy' ? colors['--demo-bullish'] : colors['--demo-bearish']) + ' / 0.4')}`,
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== COMMAND PALETTE (Bloomberg - dense) ========== */}
      {showCommand && (
        <div
          className="fixed inset-0 flex items-start justify-center pt-24 z-50"
          style={{ backgroundColor: `rgba(0,0,0,${structure.modals.backdropOpacity})` }}
          onClick={() => setShowCommand(false)}
        >
          <div
            className="w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: hsl(colors['--demo-card']),
              border: `1px solid ${hsl(colors['--demo-border'])}`,
              borderRadius: structure.commandPalette.borderRadius,
              boxShadow: structure.modals.shadow,
              overflow: 'hidden',
            }}
          >
            <div className="flex items-center gap-3 px-4 border-b" style={{ height: structure.commandPalette.inputHeight, borderColor: hsl(colors['--demo-border']) }}>
              <Search className="w-5 h-5" style={{ color: hsl(colors['--demo-muted-foreground']) }} />
              <input
                type="text"
                placeholder="Search symbols, commands..."
                value={commandQuery}
                onChange={(e) => setCommandQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none"
                style={{
                  fontFamily: structure.commandPalette.fontFamily,
                  fontSize: structure.commandPalette.inputFontSize,
                  color: hsl(colors['--demo-foreground']),
                }}
                autoFocus
              />
              <kbd
                className="px-1.5 py-0.5 text-xs"
                style={{ backgroundColor: hsl(colors['--demo-muted']), borderRadius: '2px', fontFamily: structure.commandPalette.fontFamily }}
              >
                ESC
              </kbd>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <div className="p-2">
                <div
                  className="px-2 py-1 text-xs uppercase"
                  style={{ color: hsl(colors['--demo-muted-foreground']), fontFamily: structure.commandPalette.fontFamily, letterSpacing: '0.1em' }}
                >
                  Recent
                </div>
                {['NVDA', 'TSLA earnings', 'Fed meeting'].map((item, i) => (
                  <button
                    key={item}
                    className="w-full flex items-center gap-3 hover:bg-white/5"
                    style={{
                      padding: structure.commandPalette.resultPadding,
                      fontSize: structure.commandPalette.resultFontSize,
                      fontFamily: structure.commandPalette.fontFamily,
                      backgroundColor: i === 0 ? hsl(colors['--demo-primary'] + ' / 0.1') : undefined,
                    }}
                  >
                    <Clock className="w-4 h-4" style={{ color: hsl(colors['--demo-muted-foreground']) }} />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
              <div className="p-2 border-t" style={{ borderColor: hsl(colors['--demo-border']) }}>
                <div
                  className="px-2 py-1 text-xs uppercase"
                  style={{ color: hsl(colors['--demo-muted-foreground']), fontFamily: structure.commandPalette.fontFamily, letterSpacing: '0.1em' }}
                >
                  Commands
                </div>
                {[
                  { icon: TrendingUp, label: 'Go to Symbol', shortcut: 'G S' },
                  { icon: Bell, label: 'Create Alert', shortcut: 'C A' },
                  { icon: Settings, label: 'Settings', shortcut: ',' },
                ].map((cmd) => (
                  <button
                    key={cmd.label}
                    className="w-full flex items-center gap-3 hover:bg-white/5"
                    style={{ padding: structure.commandPalette.resultPadding, fontSize: structure.commandPalette.resultFontSize, fontFamily: structure.commandPalette.fontFamily }}
                  >
                    <cmd.icon className="w-4 h-4" style={{ color: hsl(colors['--demo-muted-foreground']) }} />
                    <span className="flex-1 text-left">{cmd.label}</span>
                    <kbd className="px-1.5 py-0.5 text-xs" style={{ backgroundColor: hsl(colors['--demo-muted']), borderRadius: '2px' }}>{cmd.shortcut}</kbd>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        className="text-center py-4 text-xs border-t mt-4"
        style={{ borderColor: hsl(colors['--demo-border']), color: hsl(colors['--demo-muted-foreground']) }}
      >
        Alpha Terminal - 15 Component Types | Retro Buttons, Bloomberg Forms/Dropdowns/Data, Arctic Tables/Cards/Modals, Midnight Badges, Sunset Nav
      </div>
    </div>
  );
}
