'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, PanelRight, Maximize2, ChevronDown } from 'lucide-react';
import { ExpandedCardPanel, InlineExpandedCard, ModalExpandedCard } from './feed-cards/expanded';
import type { FeedCardData } from './feed-cards';

interface ExpandedViewsShowcaseProps {
  themeName: string;
}

// Sample data
const sampleData: FeedCardData = {
  id: '1',
  headline: 'Fed signals potential rate cut as inflation shows signs of cooling',
  summary: 'Markets rally on dovish commentary from Fed officials suggesting September pivot is increasingly likely.',
  source: { name: 'Bloomberg', handle: 'business' },
  timestamp: new Date(Date.now() - 1000 * 60 * 15),
  tickers: ['SPY', 'QQQ', 'TLT'],
  sentiment: 'bullish',
  score: 94,
  category: 'Macro',
  engagement: { comments: 127, shares: 45, likes: 892 },
};

// Mini card for triggering panel/modal
function MiniCard({
  data,
  onClick,
  label
}: {
  data: FeedCardData;
  onClick: () => void;
  label: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e0e3eb',
        boxShadow: isHovered
          ? '0 4px 12px rgba(0,0,0,0.12)'
          : '0 1px 3px rgba(0,0,0,0.08)',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
      }}
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

      {/* Content */}
      <div style={{ padding: '16px' }}>
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
      </div>

      {/* Footer with CTA */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid #e0e3eb',
        backgroundColor: isHovered ? '#f0f7ff' : '#fafbfc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        color: '#2962ff',
        fontSize: '13px',
        fontWeight: 600,
        transition: 'background-color 0.2s ease',
      }}>
        {label}
      </div>
    </div>
  );
}

// Section header
function SectionHeader({
  icon: Icon,
  title,
  description,
  color
}: {
  icon: typeof PanelRight;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '6px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          backgroundColor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
        <span style={{
          fontSize: '14px',
          fontWeight: 700,
          color: '#131722',
        }}>
          {title}
        </span>
      </div>
      <p style={{
        fontSize: '13px',
        color: '#787b86',
        lineHeight: 1.5,
        marginLeft: '42px',
      }}>
        {description}
      </p>
    </div>
  );
}

export function ExpandedViewsShowcase({ themeName }: ExpandedViewsShowcaseProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const handleBookmark = (id: string) => {
    setBookmarks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Option 1: Side Panel */}
      <div>
        <SectionHeader
          icon={PanelRight}
          title="Option 1: Side Panel"
          description="Slides in from the right. Keeps feed visible while reading. Best for traders who want to scan multiple articles quickly."
          color="#2962ff"
        />
        <MiniCard
          data={sampleData}
          onClick={() => setPanelOpen(true)}
          label="Click to open side panel →"
        />
      </div>

      {/* Option 2: Inline Expansion */}
      <div>
        <SectionHeader
          icon={ChevronDown}
          title="Option 2: Inline Expansion"
          description="Card expands in place to reveal full content. No overlay or navigation change. Best for a seamless reading experience."
          color="#26a69a"
        />
        <InlineExpandedCard
          data={sampleData}
          onBookmark={handleBookmark}
          isBookmarked={bookmarks.has(sampleData.id)}
        />
      </div>

      {/* Option 3: Modal Overlay */}
      <div>
        <SectionHeader
          icon={Maximize2}
          title="Option 3: Modal Overlay"
          description="Centers on screen with backdrop blur. More focus on content but blocks the feed. Best for detailed reading."
          color="#9c27b0"
        />
        <MiniCard
          data={sampleData}
          onClick={() => setModalOpen(true)}
          label="Click to open modal →"
        />
      </div>

      {/* Comparison Notes */}
      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '16px 20px',
        fontSize: '13px',
        color: '#555',
        lineHeight: 1.6,
      }}>
        <div style={{
          fontWeight: 700,
          marginBottom: '12px',
          color: '#131722',
          fontSize: '14px',
        }}>
          Comparison
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e0e3eb' }}>
              <th style={{ textAlign: 'left', padding: '8px 0', color: '#787b86', fontWeight: 600 }}>Feature</th>
              <th style={{ textAlign: 'center', padding: '8px', color: '#2962ff', fontWeight: 600 }}>Side Panel</th>
              <th style={{ textAlign: 'center', padding: '8px', color: '#26a69a', fontWeight: 600 }}>Inline</th>
              <th style={{ textAlign: 'center', padding: '8px', color: '#9c27b0', fontWeight: 600 }}>Modal</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e0e3eb' }}>
              <td style={{ padding: '8px 0' }}>Feed visible while reading</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>✅</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>✅</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>❌</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0e3eb' }}>
              <td style={{ padding: '8px 0' }}>Quick scan multiple articles</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>✅</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>⚠️</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>❌</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0e3eb' }}>
              <td style={{ padding: '8px 0' }}>Mobile friendly</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>⚠️</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>✅</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>✅</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e0e3eb' }}>
              <td style={{ padding: '8px 0' }}>Focus on content</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>⚠️</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>⚠️</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>✅</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0' }}>No layout shift</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>✅</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>❌</td>
              <td style={{ textAlign: 'center', padding: '8px' }}>✅</td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#e3f2fd', borderRadius: '6px' }}>
          <strong>Recommendation:</strong> Side Panel for desktop trading workflows, Inline for mobile/tablet.
        </div>
      </div>

      {/* Render panel and modal */}
      <ExpandedCardPanel
        data={sampleData}
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onBookmark={handleBookmark}
        isBookmarked={bookmarks.has(sampleData.id)}
      />

      <ModalExpandedCard
        data={sampleData}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onBookmark={handleBookmark}
        isBookmarked={bookmarks.has(sampleData.id)}
        themeName={themeName}
      />
    </div>
  );
}
