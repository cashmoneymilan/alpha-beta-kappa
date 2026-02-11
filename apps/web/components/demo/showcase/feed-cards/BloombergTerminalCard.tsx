'use client';

import { useState } from 'react';
import { bloombergStyles as styles } from './cardStyles';
import type { FeedCardData } from './types';

interface BloombergTerminalCardProps {
  data: FeedCardData;
}

export function BloombergTerminalCard({ data }: BloombergTerminalCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getSentimentClass = (sentiment?: string) => {
    if (sentiment === 'bullish') return 'text-[hsl(var(--demo-bullish))]';
    if (sentiment === 'bearish') return 'text-[hsl(var(--demo-bearish))]';
    return 'text-[hsl(var(--demo-primary))]';
  };

  const getSentimentBgClass = (sentiment?: string) => {
    if (sentiment === 'bullish') return 'bg-[hsl(var(--demo-bullish)/0.1)] border-[hsl(var(--demo-bullish)/0.25)]';
    if (sentiment === 'bearish') return 'bg-[hsl(var(--demo-bearish)/0.1)] border-[hsl(var(--demo-bearish)/0.25)]';
    return 'bg-[hsl(var(--demo-primary)/0.1)] border-[hsl(var(--demo-primary)/0.25)]';
  };

  return (
    <div
      className="bg-[hsl(var(--demo-card))] text-[hsl(var(--demo-foreground))] border border-[hsl(var(--demo-border))]"
      style={{
        ...styles.container,
        transform: isHovered ? 'translateY(-2px)' : 'none',
        transition: 'transform 0.15s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with tabs */}
      <div
        className="bg-[hsl(var(--demo-card))] border-b border-[hsl(var(--demo-border))]"
        style={styles.header}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span className="text-[hsl(var(--demo-primary))]" style={styles.headerText}>NEWS</span>
            <span className="text-[hsl(var(--demo-muted-foreground))]" style={styles.headerText}>ANALYSIS</span>
            <span className="text-[hsl(var(--demo-muted-foreground))]" style={styles.headerText}>DATA</span>
          </div>
          <span className="text-[hsl(var(--demo-muted-foreground))]" style={styles.timestamp}>{formatTime(data.timestamp)}</span>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Source line */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <span className="text-[hsl(var(--demo-primary))] font-bold text-[11px] tracking-wide">
            {data.source.name.toUpperCase()}
          </span>
          <span className="text-[hsl(var(--demo-muted-foreground))] text-[11px]">|</span>
          <span className="text-[hsl(var(--demo-muted-foreground))] text-[11px]">
            {data.category?.toUpperCase() || 'MARKET'}
          </span>
        </div>

        {/* Headline */}
        <div className="text-[hsl(var(--demo-foreground))]" style={styles.headline}>{data.headline}</div>

        {/* Summary */}
        {data.summary && (
          <div className="text-[hsl(var(--demo-muted-foreground))]" style={styles.summary}>{data.summary}</div>
        )}

        {/* Tickers */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap' as const,
          gap: '6px',
          marginTop: '12px'
        }}>
          {data.tickers.map((ticker, i) => (
            <span
              key={ticker}
              className={`bg-[hsl(var(--demo-muted))] ${i === 0 ? getSentimentClass(data.sentiment) : 'text-[hsl(var(--demo-primary))]'}`}
              style={styles.ticker}
            >
              {ticker}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="bg-[hsl(var(--demo-card))] border-t border-[hsl(var(--demo-border))]"
        style={styles.footer}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', gap: '16px', fontSize: '10px' }}>
            <span className="text-[hsl(var(--demo-muted-foreground))]">
              SCORE: <span className={`${getSentimentClass(data.sentiment)} font-bold`}>
                {data.score || 85}
              </span>
            </span>
            <span className="text-[hsl(var(--demo-muted-foreground))]">
              IMP: <span className="text-[hsl(var(--demo-foreground))]">HIGH</span>
            </span>
          </div>
          <div
            className={`${getSentimentClass(data.sentiment)} ${getSentimentBgClass(data.sentiment)} border font-bold`}
            style={{
              padding: '2px 8px',
              fontSize: '10px',
            }}
          >
            {data.sentiment?.toUpperCase() || 'NEUTRAL'}
          </div>
        </div>
      </div>
    </div>
  );
}
