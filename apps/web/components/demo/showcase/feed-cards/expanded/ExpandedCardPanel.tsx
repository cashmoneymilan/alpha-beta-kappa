'use client';

import { useState } from 'react';
import { X, Bookmark, ExternalLink, TrendingUp, TrendingDown, Clock, Share2 } from 'lucide-react';
import type { FeedCardData } from '../types';

interface ExpandedCardPanelProps {
  data: FeedCardData | null;
  isOpen: boolean;
  onClose: () => void;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
}

export function ExpandedCardPanel({
  data,
  isOpen,
  onClose,
  onBookmark,
  isBookmarked = false
}: ExpandedCardPanelProps) {
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);

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
    if (sentiment === 'bullish') return '#26a69a';
    if (sentiment === 'bearish') return '#ef5350';
    return '#787b86';
  };

  const getSentimentBg = (sentiment?: string) => {
    if (sentiment === 'bullish') return '#e8f5e9';
    if (sentiment === 'bearish') return '#ffebee';
    return '#f5f5f5';
  };

  // Extended content for demo
  const fullContent = data.summary
    ? `${data.summary}\n\nMarket participants are closely watching developments as this could signal a significant shift in monetary policy. Analysts suggest that the combination of cooling inflation data and recent labor market softness has opened the door for potential rate adjustments.\n\nKey factors being monitored include:\n• Core PCE inflation trajectory\n• Labor market conditions\n• Global economic headwinds\n• Financial stability considerations\n\nTraders should note that while the directional signal appears clear, timing and magnitude of any policy changes remain uncertain.`
    : 'Full article content would appear here...';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '420px',
        height: '100vh',
        backgroundColor: '#ffffff',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        animation: 'slideIn 0.25s ease-out',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e0e3eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fafbfc',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: '#e3f2fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px',
            color: '#2962ff',
          }}>
            {data.source.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#131722' }}>
              {data.source.name}
            </div>
            <div style={{ fontSize: '12px', color: '#787b86', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={11} />
              {formatTime(data.timestamp)}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleBookmark}
            style={{
              background: localBookmarked ? '#fff8e1' : 'transparent',
              border: '1px solid',
              borderColor: localBookmarked ? '#ffc107' : '#e0e3eb',
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
              size={18}
              color={localBookmarked ? '#f59e0b' : '#787b86'}
              fill={localBookmarked ? '#f59e0b' : 'none'}
            />
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #e0e3eb',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} color="#787b86" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {/* Headline */}
        <h2 style={{
          fontSize: '20px',
          fontWeight: 700,
          lineHeight: 1.3,
          color: '#131722',
          marginBottom: '16px',
        }}>
          {data.headline}
        </h2>

        {/* Sentiment & Score */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: getSentimentBg(data.sentiment),
          }}>
            {data.sentiment === 'bullish' ? (
              <TrendingUp size={14} color={getSentimentColor(data.sentiment)} />
            ) : data.sentiment === 'bearish' ? (
              <TrendingDown size={14} color={getSentimentColor(data.sentiment)} />
            ) : null}
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              color: getSentimentColor(data.sentiment),
              textTransform: 'capitalize',
            }}>
              {data.sentiment || 'Neutral'}
            </span>
          </div>
          {data.score && (
            <div style={{
              fontSize: '12px',
              color: '#787b86',
            }}>
              Score: <span style={{ fontWeight: 600, color: '#131722' }}>{data.score}</span>
            </div>
          )}
          {data.category && (
            <div style={{
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: '#f5f5f5',
              color: '#787b86',
              fontWeight: 500,
            }}>
              {data.category}
            </div>
          )}
        </div>

        {/* Tickers */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '24px',
        }}>
          {data.tickers.map((ticker) => (
            <span
              key={ticker}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#e3f2fd',
                color: '#2962ff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {ticker}
            </span>
          ))}
        </div>

        {/* Full Content */}
        <div style={{
          fontSize: '14px',
          lineHeight: 1.7,
          color: '#363a45',
          whiteSpace: 'pre-wrap',
        }}>
          {fullContent}
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid #e0e3eb',
        backgroundColor: '#fafbfc',
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
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: localBookmarked ? '#ffc107' : '#2962ff',
            color: localBookmarked ? '#000' : '#fff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Bookmark size={16} fill={localBookmarked ? '#000' : 'none'} />
          {localBookmarked ? 'Bookmarked' : 'Save Article'}
        </button>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #e0e3eb',
            backgroundColor: '#fff',
            color: '#131722',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <Share2 size={16} />
        </button>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #e0e3eb',
            backgroundColor: '#fff',
            color: '#131722',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <ExternalLink size={16} />
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
