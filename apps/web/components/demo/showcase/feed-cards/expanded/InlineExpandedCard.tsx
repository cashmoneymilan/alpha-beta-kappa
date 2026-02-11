'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Bookmark, ExternalLink, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import type { FeedCardData } from '../types';

interface InlineExpandedCardProps {
  data: FeedCardData;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
}

export function InlineExpandedCard({
  data,
  onBookmark,
  isBookmarked: initialBookmarked = false
}: InlineExpandedCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark?.(data.id);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
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
  const fullContent = `Market participants are closely watching developments as this could signal a significant shift in monetary policy. Analysts suggest that the combination of cooling inflation data and recent labor market softness has opened the door for potential rate adjustments.

Key factors being monitored include core PCE inflation trajectory, labor market conditions, global economic headwinds, and financial stability considerations.

Traders should note that while the directional signal appears clear, timing and magnitude of any policy changes remain uncertain.`;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e0e3eb',
        boxShadow: isHovered
          ? '0 4px 12px rgba(0,0,0,0.12)'
          : '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #e0e3eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
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
              <TrendingUp size={14} color="#26a69a" />
            ) : data.sentiment === 'bearish' ? (
              <TrendingDown size={14} color="#ef5350" />
            ) : (
              <span style={{ color: '#2962ff', fontSize: '12px', fontWeight: 700 }}>
                {data.source.name.charAt(0)}
              </span>
            )}
          </div>
          <span style={{ color: '#787b86', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase' }}>
            {data.source.name}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Clock size={12} color="#787b86" />
          <span style={{ color: '#787b86', fontSize: '12px' }}>{formatTime(data.timestamp)}</span>
        </div>
      </div>

      {/* Clickable Content */}
      <div
        style={{ padding: '16px', cursor: 'pointer' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{
          fontSize: '15px',
          fontWeight: 600,
          lineHeight: 1.4,
          color: '#131722',
          marginBottom: '8px',
        }}>
          {data.headline}
        </div>
        {data.summary && (
          <div style={{
            color: '#787b86',
            fontSize: '13px',
            lineHeight: 1.5,
          }}>
            {data.summary}
          </div>
        )}

        {/* Expand indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: '12px',
          padding: '8px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          color: '#2962ff',
          fontSize: '12px',
          fontWeight: 500,
          gap: '4px',
        }}>
          {isExpanded ? (
            <>
              <ChevronUp size={16} />
              Click to collapse
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Click to expand
            </>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{
          borderTop: '1px solid #e0e3eb',
          backgroundColor: '#fafbfc',
          animation: 'expandIn 0.2s ease-out',
        }}>
          {/* Full Article */}
          <div style={{ padding: '20px' }}>
            <div style={{
              fontSize: '14px',
              lineHeight: 1.7,
              color: '#363a45',
              marginBottom: '20px',
              whiteSpace: 'pre-wrap',
            }}>
              {fullContent}
            </div>

            {/* Related Tickers */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#787b86',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}>
                Related Tickers
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {data.tickers.map((ticker) => (
                  <span
                    key={ticker}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      backgroundColor: '#e3f2fd',
                      color: '#2962ff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {ticker}
                    <span style={{ color: getSentimentColor(data.sentiment), fontSize: '11px' }}>
                      {data.sentiment === 'bullish' ? '+1.2%' : data.sentiment === 'bearish' ? '-0.8%' : '0.0%'}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Sentiment Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
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
                {data.sentiment || 'Neutral'} Sentiment
              </span>
              {data.score && (
                <span style={{ color: '#787b86', fontSize: '12px' }}>
                  · Score: {data.score}
                </span>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid #e0e3eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <button
              onClick={handleBookmark}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: isBookmarked ? '#ffc107' : '#2962ff',
                color: isBookmarked ? '#000' : '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Bookmark size={14} fill={isBookmarked ? '#000' : 'none'} />
              {isBookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '6px',
                border: '1px solid #e0e3eb',
                backgroundColor: '#fff',
                color: '#131722',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <ExternalLink size={14} />
              Open Source
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes expandIn {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 600px;
          }
        }
      `}</style>
    </div>
  );
}
