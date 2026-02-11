'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, Bookmark } from 'lucide-react';
import { tradingViewStyles as styles } from './cardStyles';
import type { FeedCardData } from './types';

export type TradingViewCardVariant = 'default' | 'no-footer' | 'compact' | 'rich';

interface TradingViewCardProps {
  data: FeedCardData;
  variant?: TradingViewCardVariant;
  onClick?: () => void;
}

// Sentiment Badge component
function SentimentBadge({ sentiment }: { sentiment?: 'bullish' | 'bearish' | 'neutral' }) {
  const label = sentiment === 'bullish' ? 'Bullish'
              : sentiment === 'bearish' ? 'Bearish'
              : 'Neutral';

  const badgeStyle = sentiment === 'bullish' ? styles.sentimentBullish
                   : sentiment === 'bearish' ? styles.sentimentBearish
                   : styles.sentimentNeutral;

  return (
    <span style={{ ...styles.sentimentBadge, ...badgeStyle }}>
      {label}
    </span>
  );
}

export function TradingViewCard({ data, variant = 'no-footer', onClick }: TradingViewCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Mini sparkline SVG
  const renderSparkline = () => {
    const points = data.sentiment === 'bullish'
      ? '0,20 10,18 20,15 30,16 40,12 50,8 60,10 70,5 80,3 90,5 100,2'
      : data.sentiment === 'bearish'
      ? '0,5 10,8 20,6 30,10 40,12 50,15 60,14 70,18 80,16 90,19 100,22'
      : '0,12 10,10 20,14 30,12 40,13 50,11 60,13 70,12 80,14 90,11 100,13';

    const color = data.sentiment === 'bullish' ? styles.bullish
                : data.sentiment === 'bearish' ? styles.bearish
                : styles.accent;

    return (
      <svg width="100" height="24" viewBox="0 0 100 24" style={{ display: 'block' }}>
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

  // Bookmark button component
  const BookmarkButton = ({ size = 16 }: { size?: number }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsBookmarked(!isBookmarked);
      }}
      style={{
        background: 'none',
        border: 'none',
        padding: '4px',
        cursor: 'pointer',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Bookmark
        size={size}
        color={isBookmarked ? styles.accent : '#787b86'}
        fill={isBookmarked ? styles.accent : 'none'}
      />
    </button>
  );

  // Render footer based on variant
  const renderFooter = () => {
    // Variant A: No Footer
    if (variant === 'no-footer') {
      return null;
    }

    // Variant B: Compact Footer
    if (variant === 'compact') {
      return (
        <div style={styles.footerCompact}>
          <BookmarkButton size={14} />
        </div>
      );
    }

    // Variant C: Rich Footer
    if (variant === 'rich') {
      return (
        <div style={styles.footerRich}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {data.tickers.slice(0, 3).map((ticker) => (
              <span key={ticker} style={styles.tickerPill}>
                {ticker}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SentimentBadge sentiment={data.sentiment} />
            <BookmarkButton />
          </div>
        </div>
      );
    }

    // Default footer (current behavior)
    return (
      <div style={styles.footer}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}>
          <BookmarkButton />
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        ...styles.container,
        boxShadow: isHovered
          ? '0 4px 12px rgba(0,0,0,0.15)'
          : '0 1px 3px rgba(0,0,0,0.08)',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {data.sentiment === 'bullish' ? (
                <TrendingUp size={14} color={styles.bullish} />
              ) : data.sentiment === 'bearish' ? (
                <TrendingDown size={14} color={styles.bearish} />
              ) : (
                <span style={{ color: styles.accent, fontSize: '12px', fontWeight: 700 }}>
                  {data.source.name.charAt(0)}
                </span>
              )}
            </div>
            <span style={styles.headerText}>{data.source.name}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} color="#787b86" />
            <span style={styles.timestamp}>{formatTime(data.timestamp)}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        <div style={styles.headline}>{data.headline}</div>
        {data.summary && (
          <div style={{ ...styles.summary, marginTop: '8px' }}>{data.summary}</div>
        )}

        {/* Sparkline only - no tickers */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginTop: '16px'
        }}>
          {renderSparkline()}
        </div>
      </div>

      {/* Footer */}
      {renderFooter()}
    </div>
  );
}
