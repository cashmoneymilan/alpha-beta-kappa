'use client';

import { useState } from 'react';
import {
  Twitter,
  Heart,
  Repeat2,
  MessageCircle,
  Share,
  ExternalLink,
  FileText,
  Building2,
  Bookmark,
  MoreHorizontal,
  BadgeCheck,
  Newspaper,
  Rss,
  Flame,
  Zap,
} from 'lucide-react';
import { themes } from '../themes';

interface FeedCardsShowcaseProps {
  themeName: string;
}

export function FeedCardsShowcase({ themeName }: FeedCardsShowcaseProps) {
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  const theme = themes[themeName];
  const borderRadius = theme?.effects.borderRadius || '8px';

  const toggleBookmark = (id: string) => {
    setBookmarked(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      {/* Twitter/X Style Card */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          <Twitter className="w-3.5 h-3.5" />
          Social Post
        </h4>
        <div
          className="overflow-hidden"
          style={{
            backgroundColor: 'hsl(var(--demo-card))',
            borderRadius,
            border: '1px solid hsl(var(--demo-border))',
          }}
        >
          {/* Twitter Header */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex gap-3">
              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--demo-primary)), hsl(var(--demo-accent)))',
                  color: 'white',
                }}
              >
                W
              </div>
              <div className="flex-1 min-w-0">
                {/* Name row */}
                <div className="flex items-center gap-1.5">
                  <span className="font-bold">Willy C</span>
                  <BadgeCheck className="w-4 h-4" style={{ color: 'hsl(var(--demo-primary))' }} />
                  <span className="text-sm" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
                    @realwillyc · 2m
                  </span>
                  <button className="ml-auto p-1.5 rounded-full hover:bg-white/10">
                    <MoreHorizontal className="w-4 h-4" style={{ color: 'hsl(var(--demo-muted-foreground))' }} />
                  </button>
                </div>
                {/* Content */}
                <p className="mt-2 text-[15px] leading-relaxed">
                  <span style={{ color: 'hsl(var(--demo-primary))' }}>$NVDA</span> breaking out on massive volume. AI infrastructure thesis playing out exactly as expected. Watch the $500 level for confirmation.
                </p>
                {/* Tickers */}
                <div className="flex gap-2 mt-3">
                  {['NVDA', 'AMD'].map(t => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: 'hsl(var(--demo-primary) / 0.15)',
                        color: 'hsl(var(--demo-primary))',
                      }}
                    >
                      ${t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Engagement Bar */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{
              borderTop: '1px solid hsl(var(--demo-border))',
              color: 'hsl(var(--demo-muted-foreground))',
            }}
          >
            <button className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors">
              <MessageCircle className="w-4 h-4" />
              <span>24</span>
            </button>
            <button className="flex items-center gap-2 text-sm hover:text-green-400 transition-colors">
              <Repeat2 className="w-4 h-4" />
              <span>89</span>
            </button>
            <button className="flex items-center gap-2 text-sm hover:text-red-400 transition-colors">
              <Heart className="w-4 h-4" />
              <span>342</span>
            </button>
            <button className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors">
              <Share className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5 ml-2">
              <Flame className="w-4 h-4" style={{ color: 'hsl(var(--demo-accent))' }} />
              <span className="text-xs font-bold" style={{ color: 'hsl(var(--demo-accent))' }}>Hot</span>
            </div>
          </div>
        </div>
      </div>

      {/* News/Editorial Card */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          <Newspaper className="w-3.5 h-3.5" />
          News Article
        </h4>
        <div
          className="overflow-hidden"
          style={{
            backgroundColor: 'hsl(var(--demo-card))',
            borderRadius,
            border: '1px solid hsl(var(--demo-border))',
          }}
        >
          {/* Featured Image Area */}
          <div
            className="h-28 relative"
            style={{
              background: `linear-gradient(135deg, hsl(var(--demo-primary) / 0.3), hsl(var(--demo-accent) / 0.2))`,
            }}
          >
            {/* Breaking badge */}
            <div
              className="absolute top-3 left-3 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: 'hsl(var(--demo-bearish))',
                color: 'white',
              }}
            >
              Breaking
            </div>
            {/* Source Logo */}
            <div
              className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2"
              style={{
                backgroundColor: 'hsl(var(--demo-background) / 0.9)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div
                className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: 'hsl(var(--demo-accent))', color: 'white' }}
              >
                R
              </div>
              Reuters
            </div>
          </div>
          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-base leading-snug mb-2">
              Federal Reserve Signals September Rate Cut as Inflation Cools
            </h3>
            <p
              className="text-sm leading-relaxed mb-3"
              style={{ color: 'hsl(var(--demo-muted-foreground))' }}
            >
              Markets rally on dovish Fed commentary. Treasury yields drop to lowest level since April as investors price in multiple rate cuts.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {['SPY', 'QQQ', 'TLT'].map(t => (
                  <span
                    key={t}
                    className="text-xs font-mono font-semibold"
                    style={{ color: 'hsl(var(--demo-bullish))' }}
                  >
                    ${t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
                  15 min ago
                </span>
                <button
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: 'hsl(var(--demo-muted))' }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          {/* Score Bar */}
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{
              backgroundColor: 'hsl(var(--demo-bullish) / 0.1)',
              borderTop: '1px solid hsl(var(--demo-bullish) / 0.2)',
            }}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: 'hsl(var(--demo-bullish))' }} />
              <span className="text-xs font-medium" style={{ color: 'hsl(var(--demo-bullish))' }}>
                High Impact
              </span>
            </div>
            <div
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{
                backgroundColor: 'hsl(var(--demo-bullish))',
                color: 'white',
              }}
            >
              Score: 94
            </div>
          </div>
        </div>
      </div>

      {/* RSS/Reader Style Card */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          <Rss className="w-3.5 h-3.5" />
          RSS Feed
        </h4>
        <div
          style={{
            backgroundColor: 'hsl(var(--demo-card))',
            borderRadius,
            border: '1px solid hsl(var(--demo-border))',
          }}
        >
          {/* Clean minimal header */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: '1px solid hsl(var(--demo-border) / 0.5)' }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'hsl(var(--demo-muted))' }}
            >
              <Rss className="w-4 h-4" style={{ color: 'hsl(var(--demo-accent))' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Seeking Alpha</div>
              <div className="text-xs" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
                seekingalpha.com
              </div>
            </div>
            <span className="text-xs" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
              32m ago
            </span>
          </div>
          {/* Article content - clean typography focus */}
          <div className="px-4 py-4">
            <h3 className="font-serif text-lg font-medium leading-snug mb-2">
              Tesla Faces Headwinds in China as Local Competitors Gain Market Share
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'hsl(var(--demo-muted-foreground))' }}
            >
              BYD and other domestic EV makers are capturing market share as price competition intensifies. Q3 delivery estimates may need revision downward.
            </p>
          </div>
          {/* Footer with tickers and actions */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderTop: '1px solid hsl(var(--demo-border) / 0.5)' }}
          >
            <div className="flex items-center gap-2">
              {['TSLA', 'NIO', 'XPEV'].map(t => (
                <span
                  key={t}
                  className="px-2 py-0.5 text-xs font-mono rounded"
                  style={{
                    backgroundColor: 'hsl(var(--demo-muted))',
                    color: 'hsl(var(--demo-foreground))',
                  }}
                >
                  {t}
                </span>
              ))}
              <span className="text-xs" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
                +1
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => toggleBookmark('rss-1')}
                className="p-2 rounded-lg transition-colors hover:bg-white/5"
              >
                <Bookmark
                  className="w-4 h-4"
                  style={{
                    color: bookmarked.includes('rss-1')
                      ? 'hsl(var(--demo-primary))'
                      : 'hsl(var(--demo-muted-foreground))',
                    fill: bookmarked.includes('rss-1') ? 'currentColor' : 'none',
                  }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SEC Filing Card */}
      <div>
        <h4
          className="text-xs font-medium uppercase tracking-wider mb-3 flex items-center gap-2"
          style={{ color: 'hsl(var(--demo-muted-foreground))' }}
        >
          <FileText className="w-3.5 h-3.5" />
          SEC Filing
        </h4>
        <div
          style={{
            backgroundColor: 'hsl(var(--demo-card))',
            borderRadius,
            border: '2px solid hsl(var(--demo-border))',
          }}
        >
          {/* Official document header */}
          <div
            className="px-4 py-3 flex items-center gap-4"
            style={{
              backgroundColor: 'hsl(var(--demo-muted) / 0.5)',
              borderBottom: '2px solid hsl(var(--demo-border))',
            }}
          >
            {/* Filing Type Badge */}
            <div
              className="px-3 py-2 rounded font-mono text-sm font-bold"
              style={{
                backgroundColor: 'hsl(var(--demo-background))',
                border: '2px solid hsl(var(--demo-primary))',
                color: 'hsl(var(--demo-primary))',
              }}
            >
              FORM 4
            </div>
            <div className="flex-1">
              <div className="font-semibold">Statement of Changes in Beneficial Ownership</div>
              <div className="text-xs" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
                Filed with SEC · 1 hour ago
              </div>
            </div>
          </div>
          {/* Filing Details - Structured data */}
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
                  Issuer
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Building2 className="w-4 h-4" style={{ color: 'hsl(var(--demo-primary))' }} />
                  Apple Inc. (AAPL)
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
                  Reporting Person
                </div>
                <div className="font-medium">Tim Cook, CEO</div>
              </div>
            </div>
            {/* Transaction Details */}
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: 'hsl(var(--demo-bullish) / 0.1)',
                border: '1px solid hsl(var(--demo-bullish) / 0.2)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--demo-bullish))' }}>
                    Transaction
                  </div>
                  <div className="font-bold" style={{ color: 'hsl(var(--demo-bullish))' }}>
                    Purchase: 50,000 shares
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
                    @ $125.40
                  </div>
                  <div className="font-bold text-lg">$6.27M</div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs" style={{ color: 'hsl(var(--demo-muted-foreground))' }}>
              <span>Total Holdings: 2,300,000 shares</span>
              <button
                className="flex items-center gap-1 px-2 py-1 rounded transition-colors"
                style={{ backgroundColor: 'hsl(var(--demo-muted))' }}
              >
                <ExternalLink className="w-3 h-3" />
                View Filing
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
