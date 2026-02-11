'use client';

import { Wifi, WifiOff, Cloud, CloudOff, Activity, Clock, CheckCircle, XCircle, AlertCircle, Loader2, Zap, Server } from 'lucide-react';
import { getThemeStyles } from '../themes';

interface StatusIndicatorsShowcaseProps {
  themeName: string;
}

export function StatusIndicatorsShowcase({ themeName }: StatusIndicatorsShowcaseProps) {
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
    fontFamily: "'Consolas', 'Monaco', monospace",
  };

  const mutedStyle = {
    color: `hsl(${theme.colors['--demo-muted-foreground']})`,
    fontSize: '11px',
    fontFamily: "'Consolas', 'Monaco', monospace",
  };

  const cardStyle = {
    background: `hsl(${theme.colors['--demo-muted']})`,
    border: `1px solid hsl(${theme.colors['--demo-border']})`,
    borderRadius: '0px',
    padding: '12px',
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Connection Status</span>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3" style={cardStyle}>
            <div className="relative">
              <Wifi className="w-5 h-5" style={{ color: `hsl(${theme.colors['--demo-bullish']})` }} />
              <div
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse"
                style={{ background: `hsl(${theme.colors['--demo-bullish']})` }}
              />
            </div>
            <div>
              <div style={labelStyle}>WebSocket</div>
              <div style={mutedStyle}>Connected</div>
            </div>
          </div>

          <div className="flex items-center gap-3" style={cardStyle}>
            <WifiOff className="w-5 h-5" style={{ color: `hsl(${theme.colors['--demo-bearish']})` }} />
            <div>
              <div style={labelStyle}>Streaming</div>
              <div style={mutedStyle}>Disconnected</div>
            </div>
          </div>

          <div className="flex items-center gap-3" style={cardStyle}>
            <div className="relative">
              <Cloud className="w-5 h-5" style={{ color: `hsl(${theme.colors['--demo-accent']})` }} />
              <Loader2 className="absolute -top-1 -right-1 w-3 h-3 animate-spin" style={{ color: `hsl(${theme.colors['--demo-accent']})` }} />
            </div>
            <div>
              <div style={labelStyle}>API</div>
              <div style={mutedStyle}>Reconnecting...</div>
            </div>
          </div>

          <div className="flex items-center gap-3" style={cardStyle}>
            <Activity className="w-5 h-5" style={{ color: `hsl(${theme.colors['--demo-primary']})` }} />
            <div>
              <div style={labelStyle}>Latency</div>
              <div style={mutedStyle}>42ms</div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Health */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Service Health</span>
        <div style={cardStyle} className="space-y-3">
          {[
            { name: 'Trading API', status: 'operational', latency: '12ms' },
            { name: 'Market Data', status: 'operational', latency: '8ms' },
            { name: 'Order Router', status: 'degraded', latency: '156ms' },
            { name: 'Historical Data', status: 'outage', latency: '--' },
          ].map((service) => (
            <div key={service.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: `hsl(${
                      service.status === 'operational' ? theme.colors['--demo-bullish'] :
                      service.status === 'degraded' ? theme.colors['--demo-accent'] :
                      theme.colors['--demo-bearish']
                    })`,
                    boxShadow: service.status === 'operational'
                      ? `0 0 6px hsl(${theme.colors['--demo-bullish']})`
                      : 'none',
                  }}
                />
                <span style={labelStyle}>{service.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span style={mutedStyle}>{service.latency}</span>
                {service.status === 'operational' && <CheckCircle className="w-4 h-4" style={{ color: `hsl(${theme.colors['--demo-bullish']})` }} />}
                {service.status === 'degraded' && <AlertCircle className="w-4 h-4" style={{ color: `hsl(${theme.colors['--demo-accent']})` }} />}
                {service.status === 'outage' && <XCircle className="w-4 h-4" style={{ color: `hsl(${theme.colors['--demo-bearish']})` }} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Freshness */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Data Freshness</span>
        <div className="flex gap-2">
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{
              ...cardStyle,
              borderLeft: `3px solid hsl(${theme.colors['--demo-bullish']})`,
            }}
          >
            <Clock className="w-4 h-4" style={{ color: `hsl(${theme.colors['--demo-bullish']})` }} />
            <span style={mutedStyle}>Prices: <span style={labelStyle}>LIVE</span></span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{
              ...cardStyle,
              borderLeft: `3px solid hsl(${theme.colors['--demo-accent']})`,
            }}
          >
            <Clock className="w-4 h-4" style={{ color: `hsl(${theme.colors['--demo-accent']})` }} />
            <span style={mutedStyle}>News: <span style={labelStyle}>2m ago</span></span>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2"
            style={{
              ...cardStyle,
              borderLeft: `3px solid hsl(${theme.colors['--demo-bearish']})`,
            }}
          >
            <Clock className="w-4 h-4" style={{ color: `hsl(${theme.colors['--demo-bearish']})` }} />
            <span style={mutedStyle}>Options: <span style={labelStyle}>STALE</span></span>
          </div>
        </div>
      </div>

      {/* System Status Bar */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Status Bar</span>
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{
            background: `hsl(${theme.colors['--demo-card']})`,
            border: `1px solid hsl(${theme.colors['--demo-border']})`,
            borderRadius: '0px',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: `hsl(${theme.colors['--demo-bullish']})` }} />
              <span style={mutedStyle}>NYSE Open</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Server className="w-3 h-3" style={{ color: `hsl(${theme.colors['--demo-bullish']})` }} />
              <span style={mutedStyle}>All Systems Operational</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3" style={{ color: `hsl(${theme.colors['--demo-accent']})` }} />
              <span style={mutedStyle}>API: 1,234 req/min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3" style={{ color: `hsl(${theme.colors['--demo-primary']})` }} />
              <span style={mutedStyle}>Ping: 42ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Indicators */}
      <div className="space-y-3">
        <span style={sectionLabelStyle}>Inline Status</span>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: `hsl(${theme.colors['--demo-bullish']})` }} />
            <span style={mutedStyle}>Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: `hsl(${theme.colors['--demo-accent']})` }} />
            <span style={mutedStyle}>Away</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: `hsl(${theme.colors['--demo-bearish']})` }} />
            <span style={mutedStyle}>Offline</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: `hsl(${theme.colors['--demo-primary']})` }} />
            <span style={mutedStyle}>Syncing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
