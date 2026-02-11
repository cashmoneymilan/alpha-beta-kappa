'use client';

import { useState, useEffect } from 'react';
import { X, Bookmark, ExternalLink, TrendingUp, TrendingDown, Clock, Share2 } from 'lucide-react';
import type { FeedCardData } from '../types';
import { getThemeStyles } from '../../../themes';

interface ModalExpandedCardProps {
  data: FeedCardData | null;
  isOpen: boolean;
  onClose: () => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  themeName?: string;
}

export function ModalExpandedCard({
  data,
  isOpen,
  onClose,
  onBookmark,
  isBookmarked = false,
  themeName = 'bloomberg'
}: ModalExpandedCardProps) {
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);

  // Get theme colors
  const theme = getThemeStyles(themeName);
  const colors = theme.colors;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!data || !isOpen) return null;

  const handleBookmark = () => {
    setLocalBookmarked(!localBookmarked);
    onBookmark?.(data.id);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getSentimentColor = (sentiment?: string) => {
    if (sentiment === 'bullish') return `hsl(${colors['--demo-bullish']})`;
    if (sentiment === 'bearish') return `hsl(${colors['--demo-bearish']})`;
    return `hsl(${colors['--demo-muted-foreground']})`;
  };

  const getSentimentBg = (sentiment?: string) => {
    if (sentiment === 'bullish') return `hsl(${colors['--demo-bullish']} / 0.15)`;
    if (sentiment === 'bearish') return `hsl(${colors['--demo-bearish']} / 0.15)`;
    return `hsl(${colors['--demo-muted']})`;
  };

  // Extended content for demo
  const fullContent = data.summary
    ? `${data.summary}\n\nMarket participants are closely watching developments as this could signal a significant shift in monetary policy. Analysts suggest that the combination of cooling inflation data and recent labor market softness has opened the door for potential rate adjustments.\n\nKey factors being monitored include:\n• Core PCE inflation trajectory\n• Labor market conditions\n• Global economic headwinds\n• Financial stability considerations\n\nTraders should note that while the directional signal appears clear, timing and magnitude of any policy changes remain uncertain.`
    : 'Full article content would appear here...';

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '560px',
          maxHeight: '85vh',
          backgroundColor: `hsl(${colors['--demo-card']})`,
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          animation: 'modalIn 0.25s ease-out',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid hsl(${colors['--demo-border']})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: `hsl(${colors['--demo-muted-foreground']})`, fontSize: '13px' }}>
            <Clock size={14} />
            {formatTime(data.timestamp)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleBookmark}
              style={{
                background: localBookmarked ? `hsl(${colors['--demo-accent']} / 0.2)` : 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={localBookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              <Bookmark
                size={20}
                color={localBookmarked ? '#f59e0b' : `hsl(${colors['--demo-muted-foreground']})`}
                fill={localBookmarked ? '#f59e0b' : 'none'}
              />
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} color={`hsl(${colors['--demo-muted-foreground']})`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* Source */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: `hsl(${colors['--demo-primary']} / 0.15)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '16px',
              color: `hsl(${colors['--demo-primary']})`,
            }}>
              {data.source.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: `hsl(${colors['--demo-foreground']})` }}>
                {data.source.name}
              </div>
              {data.category && (
                <div style={{ fontSize: '12px', color: `hsl(${colors['--demo-muted-foreground']})` }}>
                  {data.category}
                </div>
              )}
            </div>
          </div>

          {/* Headline */}
          <h2 style={{
            fontSize: '22px',
            fontWeight: 700,
            lineHeight: 1.3,
            color: `hsl(${colors['--demo-foreground']})`,
            marginBottom: '20px',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}>
            {data.headline}
          </h2>

          {/* Tickers */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '20px',
          }}>
            {data.tickers.map((ticker) => (
              <span
                key={ticker}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  backgroundColor: `hsl(${colors['--demo-muted']})`,
                  color: `hsl(${colors['--demo-primary']})`,
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ${ticker}
              </span>
            ))}
          </div>

          {/* Sentiment Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '8px',
            backgroundColor: getSentimentBg(data.sentiment),
            marginBottom: '24px',
          }}>
            {data.sentiment === 'bullish' ? (
              <TrendingUp size={16} color={getSentimentColor(data.sentiment)} />
            ) : data.sentiment === 'bearish' ? (
              <TrendingDown size={16} color={getSentimentColor(data.sentiment)} />
            ) : null}
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: getSentimentColor(data.sentiment),
              textTransform: 'capitalize',
            }}>
              {data.sentiment || 'Neutral'}
            </span>
            {data.score && (
              <>
                <span style={{ color: `hsl(${colors['--demo-border']})` }}>|</span>
                <span style={{ fontSize: '13px', color: `hsl(${colors['--demo-muted-foreground']})` }}>
                  Score: <strong style={{ color: `hsl(${colors['--demo-foreground']})` }}>{data.score}</strong>
                </span>
              </>
            )}
          </div>

          {/* Full Content */}
          <div style={{
            fontSize: '15px',
            lineHeight: 1.8,
            color: `hsl(${colors['--demo-foreground']})`,
            whiteSpace: 'pre-wrap',
          }}>
            {fullContent}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid hsl(${colors['--demo-border']})`,
          display: 'flex',
          gap: '12px',
        }}>
          <button
            onClick={handleBookmark}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '14px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: localBookmarked ? '#ffc107' : `hsl(${colors['--demo-primary']})`,
              color: localBookmarked ? '#000' : `hsl(${colors['--demo-primary-foreground']})`,
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Bookmark size={18} fill={localBookmarked ? '#000' : 'none'} />
            {localBookmarked ? 'Saved' : 'Save'}
          </button>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 20px',
              borderRadius: '10px',
              border: `1px solid hsl(${colors['--demo-border']})`,
              backgroundColor: `hsl(${colors['--demo-card']})`,
              color: `hsl(${colors['--demo-foreground']})`,
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <Share2 size={18} />
          </button>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '14px 20px',
              borderRadius: '10px',
              border: `1px solid hsl(${colors['--demo-border']})`,
              backgroundColor: `hsl(${colors['--demo-card']})`,
              color: `hsl(${colors['--demo-foreground']})`,
              fontSize: '15px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <ExternalLink size={18} />
            Source
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
}
