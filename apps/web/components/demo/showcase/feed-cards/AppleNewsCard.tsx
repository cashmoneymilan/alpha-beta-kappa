'use client';

import { useState } from 'react';
import { Bookmark, Share } from 'lucide-react';
import { appleNewsStyles as styles } from './cardStyles';
import type { FeedCardData } from './types';

export type AppleNewsCardVariant = 'default' | 'no-footer' | 'compact' | 'rich';

interface AppleNewsCardProps {
  data: FeedCardData;
  variant?: AppleNewsCardVariant;
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

export function AppleNewsCard({ data, variant = 'no-footer', onClick }: AppleNewsCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Bookmark button component
  const BookmarkButton = () => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsBookmarked(!isBookmarked);
      }}
      style={{
        background: 'none',
        border: 'none',
        padding: '8px',
        cursor: 'pointer',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isBookmarked ? '#fff2f2' : 'transparent',
      }}
    >
      <Bookmark
        size={18}
        color={isBookmarked ? styles.accent : '#86868b'}
        fill={isBookmarked ? styles.accent : 'none'}
      />
    </button>
  );

  // Share button component
  const ShareButton = () => (
    <button
      onClick={(e) => e.stopPropagation()}
      style={{
        background: 'none',
        border: 'none',
        padding: '8px',
        cursor: 'pointer',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Share size={18} color="#86868b" />
    </button>
  );

  // Source component
  const SourceInfo = ({ showTimestamp = true }: { showTimestamp?: boolean }) => (
    <div style={styles.source}>
      <div style={styles.sourceIcon}>
        {data.source.name.charAt(0)}
      </div>
      <div>
        <div style={{ ...styles.sourceName, color: '#1d1d1f' }}>
          {data.source.name}
        </div>
        {showTimestamp && (
          <div style={styles.timestamp}>
            {formatTime(data.timestamp)}
          </div>
        )}
      </div>
    </div>
  );

  // Render footer based on variant
  const renderFooter = () => {
    // Variant A: No Footer
    if (variant === 'no-footer') {
      return null;
    }

    // Variant B: Compact Footer (source only, no actions)
    if (variant === 'compact') {
      return (
        <div style={{
          borderTop: '1px solid #f5f5f7',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <SourceInfo />
        </div>
      );
    }

    // Variant C: Rich Footer (source + tickers + bookmark)
    if (variant === 'rich') {
      return (
        <div style={styles.footerRich}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SourceInfo showTimestamp={false} />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {data.tickers.slice(0, 3).map((ticker) => (
                <span key={ticker} style={styles.tickerPill}>
                  {ticker}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <SentimentBadge sentiment={data.sentiment} />
            <BookmarkButton />
          </div>
        </div>
      );
    }

    // Default footer (current behavior)
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid #f5f5f7',
        paddingTop: '16px',
        marginTop: '4px',
      }}>
        <SourceInfo />
        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <BookmarkButton />
          <ShareButton />
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        ...styles.container,
        boxShadow: isHovered
          ? '0 8px 24px rgba(0,0,0,0.12)'
          : '0 4px 12px rgba(0,0,0,0.08)',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Content - Compact layout without hero */}
      <div style={styles.content}>
        {/* Headline in serif font */}
        <h3 style={styles.headline}>{data.headline}</h3>

        {/* Summary text */}
        {data.summary && (
          <p style={styles.summary}>{data.summary}</p>
        )}

        {/* Footer */}
        {renderFooter()}
      </div>
    </div>
  );
}
