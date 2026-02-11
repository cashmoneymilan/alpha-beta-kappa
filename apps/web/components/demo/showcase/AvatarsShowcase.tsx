'use client';

import { User, Bot, Building2, TrendingUp, Newspaper, BarChart3, Globe, Radio } from 'lucide-react';
import { getThemeStyles } from '../themes';

interface AvatarsShowcaseProps {
  themeName: string;
}

export function AvatarsShowcase({ themeName }: AvatarsShowcaseProps) {
  const theme = getThemeStyles(themeName);

  const sectionLabelStyle = {
    color: `hsl(${theme.colors['--demo-muted-foreground']})`,
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    fontFamily: "'Consolas', 'Monaco', monospace",
  };

  const labelStyle = {
    color: `hsl(${theme.colors['--demo-foreground']})`,
    fontSize: '12px',
    fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
  };

  const mutedStyle = {
    color: `hsl(${theme.colors['--demo-muted-foreground']})`,
    fontSize: '11px',
    fontFamily: "'Consolas', 'Monaco', monospace",
  };

  const avatarBaseStyle = {
    background: `hsl(${theme.colors['--demo-muted']})`,
    border: `1px solid hsl(${theme.colors['--demo-border']})`,
    color: `hsl(${theme.colors['--demo-muted-foreground']})`,
  };

  const sources = [
    { icon: Newspaper, name: 'Bloomberg', color: theme.colors['--demo-accent'], initials: 'BL' },
    { icon: TrendingUp, name: 'Reuters', color: theme.colors['--demo-primary'], initials: 'RT' },
    { icon: BarChart3, name: 'CNBC', color: theme.colors['--demo-bearish'], initials: 'CN' },
    { icon: Globe, name: 'WSJ', color: theme.colors['--demo-bullish'], initials: 'WS' },
    { icon: Radio, name: 'Twitter/X', color: theme.colors['--demo-foreground'], initials: 'X' },
  ];

  const analysts = [
    { name: 'Sarah Chen', role: 'Senior Analyst', initials: 'SC', rating: 'Buy' },
    { name: 'Michael Ross', role: 'Quant Strategist', initials: 'MR', rating: 'Hold' },
    { name: 'Emma Wilson', role: 'Tech Analyst', initials: 'EW', rating: 'Strong Buy' },
  ];

  return (
    <div className="space-y-6">
      {/* Avatar Sizes */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Sizes</span>
        <div className="flex items-end gap-4">
          {/* XS */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={avatarBaseStyle}
            >
              <User className="w-3 h-3" />
            </div>
            <span style={mutedStyle}>xs</span>
          </div>
          {/* SM */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={avatarBaseStyle}
            >
              <User className="w-4 h-4" />
            </div>
            <span style={mutedStyle}>sm</span>
          </div>
          {/* MD */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={avatarBaseStyle}
            >
              <User className="w-5 h-5" />
            </div>
            <span style={mutedStyle}>md</span>
          </div>
          {/* LG */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={avatarBaseStyle}
            >
              <User className="w-6 h-6" />
            </div>
            <span style={mutedStyle}>lg</span>
          </div>
          {/* XL */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={avatarBaseStyle}
            >
              <User className="w-8 h-8" />
            </div>
            <span style={mutedStyle}>xl</span>
          </div>
        </div>
      </div>

      {/* Source Icons */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>News Sources</span>
        <div className="flex gap-3">
          {sources.map((source) => (
            <div key={source.name} className="flex flex-col items-center gap-2">
              <div
                className="w-10 h-10 rounded flex items-center justify-center"
                style={{
                  background: `hsl(${source.color} / 0.15)`,
                  border: `1px solid hsl(${source.color} / 0.3)`,
                }}
              >
                <source.icon className="w-5 h-5" style={{ color: `hsl(${source.color})` }} />
              </div>
              <span style={mutedStyle}>{source.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Initials Avatars */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Initials / Text</span>
        <div className="flex gap-3">
          {sources.map((source) => (
            <div
              key={source.name}
              className="w-10 h-10 rounded flex items-center justify-center font-bold text-sm"
              style={{
                background: `hsl(${source.color} / 0.15)`,
                color: `hsl(${source.color})`,
                fontFamily: "'Consolas', 'Monaco', monospace",
              }}
            >
              {source.initials}
            </div>
          ))}
        </div>
      </div>

      {/* Asset Logos */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Asset Logos</span>
        <div className="flex gap-3">
          {[
            { symbol: 'AAPL', color: theme.colors['--demo-muted-foreground'] },
            { symbol: 'GOOGL', color: theme.colors['--demo-primary'] },
            { symbol: 'MSFT', color: theme.colors['--demo-bullish'] },
            { symbol: 'AMZN', color: theme.colors['--demo-accent'] },
            { symbol: 'TSLA', color: theme.colors['--demo-bearish'] },
          ].map((asset) => (
            <div
              key={asset.symbol}
              className="w-10 h-10 rounded flex items-center justify-center font-bold text-xs"
              style={{
                background: `hsl(${asset.color} / 0.15)`,
                color: `hsl(${asset.color})`,
                fontFamily: "'Consolas', 'Monaco', monospace",
                letterSpacing: '-0.05em',
              }}
            >
              {asset.symbol.slice(0, 2)}
            </div>
          ))}
        </div>
      </div>

      {/* With Status */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>With Status Indicator</span>
        <div className="flex gap-4">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={avatarBaseStyle}
            >
              <Bot className="w-5 h-5" />
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{
                background: `hsl(${theme.colors['--demo-bullish']})`,
                borderColor: `hsl(${theme.colors['--demo-background']})`,
              }}
            />
          </div>
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={avatarBaseStyle}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{
                background: `hsl(${theme.colors['--demo-accent']})`,
                borderColor: `hsl(${theme.colors['--demo-background']})`,
              }}
            />
          </div>
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={avatarBaseStyle}
            >
              <User className="w-5 h-5" />
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
              style={{
                background: `hsl(${theme.colors['--demo-bearish']})`,
                borderColor: `hsl(${theme.colors['--demo-background']})`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Analyst Cards */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Analyst Avatars</span>
        <div className="space-y-2">
          {analysts.map((analyst) => (
            <div
              key={analyst.name}
              className="flex items-center gap-3 p-2"
              style={{
                background: `hsl(${theme.colors['--demo-muted']})`,
                border: `1px solid hsl(${theme.colors['--demo-border']})`,
                borderRadius: '4px',
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-xs"
                style={{
                  background: `hsl(${theme.colors['--demo-primary']} / 0.15)`,
                  color: `hsl(${theme.colors['--demo-primary']})`,
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                {analyst.initials}
              </div>
              <div className="flex-1">
                <div style={labelStyle}>{analyst.name}</div>
                <div style={mutedStyle}>{analyst.role}</div>
              </div>
              <div
                className="px-2 py-1 text-xs font-medium"
                style={{
                  background: `hsl(${analyst.rating.includes('Buy') ? theme.colors['--demo-bullish'] : theme.colors['--demo-muted-foreground']} / 0.15)`,
                  color: `hsl(${analyst.rating.includes('Buy') ? theme.colors['--demo-bullish'] : theme.colors['--demo-muted-foreground']})`,
                  borderRadius: '4px',
                }}
              >
                {analyst.rating}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avatar Group */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Avatar Group</span>
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {['SC', 'MR', 'EW', 'JK', 'PL'].map((initials, i) => (
              <div
                key={initials}
                className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs border-2"
                style={{
                  background: `hsl(${theme.colors['--demo-muted']})`,
                  color: `hsl(${theme.colors['--demo-foreground']})`,
                  borderColor: `hsl(${theme.colors['--demo-background']})`,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  zIndex: 5 - i,
                }}
              >
                {initials}
              </div>
            ))}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs border-2"
              style={{
                background: `hsl(${theme.colors['--demo-primary']})`,
                color: `hsl(${theme.colors['--demo-primary-foreground']})`,
                borderColor: `hsl(${theme.colors['--demo-background']})`,
                fontFamily: "'Consolas', 'Monaco', monospace",
              }}
            >
              +3
            </div>
          </div>
          <span className="ml-3" style={mutedStyle}>8 analysts following</span>
        </div>
      </div>
    </div>
  );
}
